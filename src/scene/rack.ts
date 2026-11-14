import { Box, Camera, Geometry, Mesh, Plane, Program, Renderer, Texture, Transform, Vec3 } from "ogl";

export type RackUnitSpec = {
  u: number;
  label: string;
  sub: string;
  kind?: "compute" | "network" | "appliance" | "power" | "audio";
  flicker?: boolean;
};

export type FrameInfo = {
  /** 0 → docked, 1 → fully ejected. */
  eject: number;
  /** Screen-space position of the active unit's front face, in CSS pixels. */
  x: number;
  y: number;
  /** Screen-space position of the drawer's front-left port, where content exits. */
  portX: number;
  portY: number;
  /** How far the drawer is out, in CSS pixels of apparent travel. */
  reach: number;
  /** Screen-space height of the drawer's face, in CSS pixels. */
  faceH: number;
};

type PresentationMode = "split" | "front";

type Options = {
  onStats?: (s: { fps: number; tris: number }) => void;
  onFirstFrame?: () => void;
  initialMode?: PresentationMode;
};

export type Handle = {
  setActive: (i: number) => void;
  setPose: (fromUnit: number, toUnit: number, rackT: number, ejects: number[], activeIdx: number) => void;
  setPresentationMode: (mode: PresentationMode) => void;
  setPaused: (paused: boolean) => void;
  hitUnit: (clientX: number, clientY: number) => number;
  setHoverUnit: (i: number) => void;
  hitHdd: (clientX: number, clientY: number) => boolean;
  setHddHover: (on: boolean) => void;
  setGrid: (on: boolean) => void;
  setFrameCallback: (cb: ((f: FrameInfo) => void) | null) => void;
  destroy: () => void;
};

const UNIT = 48;
const WIDTH = 452;
const RACK_DEPTH = 480;

const vertex = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform vec3 cameraPosition;

  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vView;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec4 mv = viewMatrix * world;
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform vec3 uAmbient;
  uniform vec3 uFillDir;
  uniform vec3 uFillColor;
  uniform float uRim;
  uniform float uGrid;
  uniform float uUseMap;
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uUnlit;
  uniform float uIsFloor;

  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vView;

  void main() {
    if (uUnlit > 0.5) {
      vec3 c = uUseMap > 0.5 ? texture2D(uMap, vUv).rgb : uColor;
      gl_FragColor = vec4(c, uOpacity);
      return;
    }

    vec3 n = normalize(vNormal);
    float ndl = max(dot(n, normalize(uLightDir)), 0.0);

    vec3 base = uColor;
    float texAlpha = 1.0;
    if (uUseMap > 0.5) {
      vec4 tex = texture2D(uMap, vUv);
      base = tex.rgb;
      if (uIsFloor > 0.5) texAlpha = tex.a;
    }

    float fill = max(dot(n, normalize(uFillDir)), 0.0);

    vec3 color = base * (uAmbient + uLightColor * ndl + uFillColor * fill * 0.4);

    // specular
    vec3 h = normalize(normalize(uLightDir) + vView);
    float specPow = uIsFloor > 0.5 ? 28.0 : 52.0;
    float specStr = uIsFloor > 0.5 ? 0.24 : 0.55;
    float spec = pow(max(dot(n, h), 0.0), specPow) * specStr;
    color += uLightColor * spec * (0.3 + 0.7 * ndl);

    // fresnel rim
    float fres = pow(1.0 - max(dot(n, vView), 0.0), 3.0);
    color += vec3(1.0, 0.78, 0.55) * fres * uRim;

    // cheap occlusion: vertical cabinet faces darken toward their bottom edge
    if (uIsFloor < 0.5) {
      color *= mix(0.62, 1.0, smoothstep(0.0, 0.42, vUv.y));
    }

    // debug view: UV/tessellation grid
    if (uGrid > 0.5) {
      vec2 gridFreq = uIsFloor > 0.5 ? vec2(12.0, 12.0) : vec2(22.0, 7.0);
      vec2 g = abs(fract(vUv * gridFreq) - 0.5);
      float edge = 1.0 - smoothstep(0.0, 0.035, min(g.x, g.y));
      color = mix(color, vec3(0.35, 0.95, 0.62), edge * 0.7);
    }

    gl_FragColor = vec4(color, uOpacity * texAlpha);
  }
`;

type LedSpec = { ux: number; uy: number; phase: number; rate: number; w?: number; h?: number };

const CANVAS_MONO = '"Maple Mono", ui-monospace, monospace';

// Shared world coordinates (relative to faceMesh center) for the 4U studio DAC so 2D silkscreen & 3D hardware align.
const DAC_FACE_W = WIDTH * 0.995;
const DAC_FACE_H = 4 * UNIT * 0.98;
const DAC_LAYOUT = {
  screen: { x: -125, y: 31, w: 144, h: 54 },
  toggles: [
    { x: -28, y: 29, name: "PWR", upTxt: "ON", dnTxt: "STBY", up: true, led: true },
    { x: -3, y: 29, name: "GAIN", upTxt: "HI", dnTxt: "LO", up: true, led: false },
    { x: 22, y: 29, name: "FILT", upTxt: "LIN", dnTxt: "MIN", up: false, led: false },
  ],
  knobs: [
    { x: -186, y: -38, r: 12, d: 13, name: "INPUT", angle: -0.78, ticks: 5, tickLabels: ["USB", "", "AES", "", "OPT"], hero: false },
    { x: -125, y: -38, r: 23, d: 18, name: "MASTER ATTEN", angle: 0.62, ticks: 11, tickLabels: ["-∞", "", "", "", "", "-12", "", "", "", "", "0dB"], hero: true },
    { x: -66, y: -38, r: 11.5, d: 12, name: "TRIM", angle: 0.28, ticks: 7, tickLabels: ["-6", "", "", "0", "", "", "+6"], hero: false },
  ],
  xlr: { x: -30, y: -38, r: 11.5, name: "BAL 4-PIN XLR" },
  trs: { x: 2, y: -38, r: 7.8, name: "PHONES" },
  rca: [
    { x: 26, y: -24, r: 5.2, ring: [0.76, 0.78, 0.82] as [number, number, number], css: "#cdd3d9", name: "COAX" },
    { x: 26, y: -50, r: 5.2, ring: [0.74, 0.31, 0.21] as [number, number, number], css: "#c95b3c", name: "AUX" },
  ],
} as const;

function dacLocalToCanvas(wx: number, wy: number, W: number, H: number): [number, number] {
  return [(0.5 + wx / DAC_FACE_W) * W, (0.5 - wy / DAC_FACE_H) * H];
}

function makeFaceTexture(
  label: string,
  sub: string,
  u: number,
  kind: RackUnitSpec["kind"],
  flicker: boolean,
): { canvas: HTMLCanvasElement; leds: LedSpec[] } {
  const c = document.createElement("canvas");
  const scale = 3;
  c.width = WIDTH * scale;
  c.height = u * UNIT * scale;
  const ctx = c.getContext("2d")!;
  const W = c.width;
  const H = c.height;
  const leds: LedSpec[] = [];

  // chassis face
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#32383e");
  g.addColorStop(0.08, "#252a2f");
  g.addColorStop(0.55, "#1e2328");
  g.addColorStop(1, "#161a1e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const pad = 6 * scale;
  const lx = W * 0.6;
  const lw = W - lx - 12 * scale;
  const faceRight = lx - 6 * scale;

  if (kind === "network" || label === "PATCH" || label === "GATEWAY") {
    // 1U 24-port RJ45 + dual SFP+ network patch/gateway panel
    const panelX = pad;
    const panelW = faceRight - panelX;
    ctx.fillStyle = "#171b1f";
    ctx.fillRect(panelX, pad, panelW, H - pad * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(panelX + 0.5, pad + 0.5, panelW - 1, H - pad * 2 - 1);

    const cols = 12;
    const rows = 2;
    const portW = 12 * scale;
    const portH = 9.5 * scale;
    const gapX = 2.8 * scale;
    const bankGap = 7 * scale;
    const gapY = 3.5 * scale;
    const startX = panelX + 8 * scale;
    const totalGridH = rows * portH + (rows - 1) * gapY;
    const startY = (H - totalGridH) * 0.5 + 1.5 * scale;

    ctx.fillStyle = "rgba(210,216,222,0.45)";
    ctx.font = `${4.2 * scale}px ${CANVAS_MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("CAT6A · 24P", startX, pad + 4.5 * scale);

    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const extra = col >= 6 ? bankGap : 0;
        const px = startX + col * (portW + gapX) + extra;
        const py = startY + r * (portH + gapY);

        // keystone recess
        ctx.fillStyle = "#090b0d";
        ctx.fillRect(px, py, portW, portH);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 0.6 * scale;
        ctx.strokeRect(px, py, portW, portH);

        // RJ45 stepped cutout
        ctx.fillStyle = "#030405";
        ctx.fillRect(px + 2 * scale, py + 2.2 * scale, portW - 4 * scale, portH - 3.8 * scale);
        ctx.fillRect(px + 4 * scale, py + 1 * scale, portW - 8 * scale, 1.5 * scale);

        // gold pins
        ctx.fillStyle = "#c99e48";
        for (let p = 0; p < 4; p++) {
          ctx.fillRect(px + (3 + p * 1.6) * scale, py + 2.5 * scale, 0.8 * scale, 2 * scale);
        }

        // port link LED
        const activePort = (r * 12 + col) % 5 === 0 || (r === 0 && col < 4);
        const ledX = px + portW - 2.6 * scale;
        const ledY = py + 0.8 * scale;
        ctx.fillStyle = activePort ? (col % 2 === 0 ? "#5fd97a" : "#e0a34a") : "#1c2227";
        ctx.fillRect(ledX, ledY, 1.8 * scale, 1.2 * scale);
        if (flicker && activePort && col % 2 === 0) {
          leds.push({
            ux: (ledX + 0.9 * scale) / W,
            uy: (ledY + 0.6 * scale) / H,
            phase: (r * 12 + col) * 1.13 + 0.3,
            rate: 4.5 + ((r + col) % 4) * 1.1,
            w: 1.9,
            h: 1.3,
          });
        }
      }
    }

    // Dual SFP+ fiber cages to the right of RJ45 banks
    const sfpX = startX + cols * (portW + gapX) + bankGap + 6 * scale;
    const sfpW = Math.min(26 * scale, faceRight - sfpX - 6 * scale);
    if (sfpW > 12 * scale) {
      ctx.fillStyle = "rgba(210,216,222,0.45)";
      ctx.fillText("SFP+", sfpX, pad + 4.5 * scale);
      for (let r = 0; r < 2; r++) {
        const sy = startY + r * (portH + gapY);
        ctx.fillStyle = "#2b3137";
        ctx.fillRect(sfpX, sy, sfpW, portH);
        ctx.fillStyle = "#06080a";
        ctx.fillRect(sfpX + 2.5 * scale, sy + 2 * scale, sfpW - 5 * scale, portH - 4 * scale);
        const sfpLedX = sfpX + sfpW - 3.5 * scale;
        const sfpLedY = sy + 1 * scale;
        ctx.fillStyle = "#5fd97a";
        ctx.fillRect(sfpLedX, sfpLedY, 2 * scale, 1.5 * scale);
        if (flicker) {
          leds.push({
            ux: (sfpLedX + 1 * scale) / W,
            uy: (sfpLedY + 0.75 * scale) / H,
            phase: r * 2.4 + 0.9,
            rate: 5.2 + r * 1.4,
            w: 2.1,
            h: 1.6,
          });
        }
      }
    }
  } else if (kind === "power" || label === "UPS / PDU" || label === "POWER") {
    // 2U UPS / switched PDU front panel
    const panelX = pad;
    const panelW = faceRight - panelX;
    ctx.fillStyle = "#191d22";
    ctx.fillRect(panelX, pad, panelW, H - pad * 2);

    // OLED status / load readout box
    const oledX = panelX + 8 * scale;
    const oledY = pad + 8 * scale;
    const oledW = 88 * scale;
    const oledH = H - pad * 2 - 16 * scale;
    ctx.fillStyle = "#090c10";
    ctx.fillRect(oledX, oledY, oledW, oledH);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 0.8 * scale;
    ctx.strokeRect(oledX, oledY, oledW, oledH);

    ctx.fillStyle = "#5fd97a";
    ctx.font = `${5.5 * scale}px ${CANVAS_MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("ONLINE · 230V", oledX + 6 * scale, oledY + 11 * scale);
    ctx.fillStyle = "rgba(210,216,222,0.6)";
    ctx.font = `${4.8 * scale}px ${CANVAS_MONO}`;
    ctx.fillText("UPS / PDU LOAD", oledX + 6 * scale, oledY + 21 * scale);

    // segmented load meter bar
    for (let seg = 0; seg < 10; seg++) {
      const sx = oledX + (6 + seg * 7.5) * scale;
      const sy = oledY + oledH - 12 * scale;
      ctx.fillStyle = seg < 6 ? "#5fd97a" : seg < 8 ? "#e0a34a" : "#1f252b";
      ctx.fillRect(sx, sy, 5.5 * scale, 5 * scale);
    }

    // 2x4 IEC C13 switched PDU outlets
    const bankX = oledX + oledW + 14 * scale;
    const outW = 24 * scale;
    const outH = 16 * scale;
    const outGapX = 6 * scale;
    const outGapY = 8 * scale;
    const bankY = (H - (2 * outH + outGapY)) * 0.5;
    for (let r = 0; r < 2; r++) {
      for (let col = 0; col < 4; col++) {
        const ox = bankX + col * (outW + outGapX);
        const oy = bankY + r * (outH + outGapY);
        if (ox + outW > faceRight - 6 * scale) continue;
        ctx.fillStyle = "#080a0c";
        ctx.fillRect(ox, oy, outW, outH);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.strokeRect(ox, oy, outW, outH);
        // 3 copper C13 slots
        ctx.fillStyle = "#2b3036";
        ctx.fillRect(ox + outW * 0.5 - 1.2 * scale, oy + 3.5 * scale, 2.4 * scale, 4 * scale);
        ctx.fillRect(ox + 5 * scale, oy + 8.5 * scale, 2.4 * scale, 4 * scale);
        ctx.fillRect(ox + outW - 7.4 * scale, oy + 8.5 * scale, 2.4 * scale, 4 * scale);
        // outlet status LED
        ctx.fillStyle = "#5fd97a";
        ctx.fillRect(ox + outW - 4 * scale, oy + 2 * scale, 2 * scale, 2 * scale);
      }
    }
  } else if (u >= 8) {
    // 8U high-density storage & compute chassis: header strip + 4x5 horizontal drive sleds + bottom PSU/fan bay
    const hdrY = pad + 2 * scale;
    const hdrH = 22 * scale;
    ctx.fillStyle = "#191d22";
    ctx.fillRect(pad, hdrY, faceRight - pad, hdrH);

    // diagnostic LCD & front status LEDs
    const lcdX = pad + 8 * scale;
    ctx.fillStyle = "#090c10";
    ctx.fillRect(lcdX, hdrY + 4 * scale, 110 * scale, hdrH - 8 * scale);
    ctx.fillStyle = "#e0a34a";
    ctx.font = `${5.5 * scale}px ${CANVAS_MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("ARTIFACT // ONLINE", lcdX + 6 * scale, hdrY + 13.5 * scale);

    ["PWR", "ACT", "NET", "HEALTH"].forEach((lbl, idx) => {
      const bx = lcdX + (122 + idx * 30) * scale;
      const by = hdrY + 9 * scale;
      ctx.fillStyle = idx === 1 ? "#e0a34a" : "#5fd97a";
      ctx.beginPath();
      ctx.arc(bx, by, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      if (flicker && (idx === 0 || idx === 2)) {
        leds.push({ ux: bx / W, uy: by / H, phase: idx * 2.1 + 0.5, rate: 5.5 + idx * 2 });
      }
      ctx.fillStyle = "rgba(210,216,222,0.55)";
      ctx.font = `${4.2 * scale}px ${CANVAS_MONO}`;
      ctx.fillText(lbl, bx - 4 * scale, hdrY + 17 * scale);
    });

    // 4 rows x 5 cols = 20 horizontal hot-swap drive caddies
    const rows = 4;
    const cols = 5;
    const gapX = 4.5 * scale;
    const gapY = 6 * scale;
    const gridX = pad + 2 * scale;
    const gridY = hdrY + hdrH + 8 * scale;
    const gridW = faceRight - gridX - 2 * scale;
    const gridH = H - gridY - 46 * scale;
    const bayW = (gridW - (cols - 1) * gapX) / cols;
    const bayH = (gridH - (rows - 1) * gapY) / rows;

    let idxNum = 0;
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const bx = gridX + col * (bayW + gapX);
        const by = gridY + r * (bayH + gapY);

        const bg = ctx.createLinearGradient(bx, by, bx, by + bayH);
        bg.addColorStop(0, "#383e44");
        bg.addColorStop(1, "#22262a");
        ctx.fillStyle = bg;
        ctx.fillRect(bx, by, bayW, bayH);

        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(bx + 0.5, by + 0.5, bayW - 1, bayH - 1);

        // airflow vents on left of each horizontal caddy
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        for (let s = 0; s < 4; s++) {
          ctx.fillRect(bx + 4 * scale, by + (6 + s * 6.5) * scale, bayW - 18 * scale, 2.5 * scale);
        }

        // amber eject release button on right
        ctx.fillStyle = "#b85c38";
        ctx.fillRect(bx + bayW - 9 * scale, by + 6 * scale, 5 * scale, bayH - 12 * scale);

        // activity LED
        const ledX = bx + bayW - 6.5 * scale;
        const ledY = by + 3.5 * scale;
        ctx.fillStyle = idxNum % 3 === 0 ? "#5fd97a" : "#3f7a4f";
        ctx.beginPath();
        ctx.arc(ledX, ledY, 1.3 * scale, 0, Math.PI * 2);
        ctx.fill();
        if (flicker && (idxNum % 3 === 0 || idxNum === 4 || idxNum === 13)) {
          leds.push({ ux: ledX / W, uy: ledY / H, phase: idxNum * 1.37 + 0.4, rate: 3.8 + (idxNum % 5) * 0.9 });
        }

        // bay number
        ctx.fillStyle = "rgba(210,216,222,0.55)";
        ctx.font = `${4.8 * scale}px ${CANVAS_MONO}`;
        ctx.textAlign = "right";
        ctx.fillText(String(idxNum).padStart(2, "0"), bx + bayW - 12 * scale, by + bayH - 4 * scale);
        idxNum++;
      }
    }

    // Bottom blower & redundant PSU bar
    const botY = H - 36 * scale;
    const botH = 30 * scale;
    ctx.fillStyle = "#16191d";
    ctx.fillRect(pad, botY, faceRight - pad, botH);
    const psuCount = 3;
    const psuW = (faceRight - pad - 16 * scale) / psuCount;
    for (let p = 0; p < psuCount; p++) {
      const px = pad + 4 * scale + p * (psuW + 4 * scale);
      ctx.fillStyle = "#252a2f";
      ctx.fillRect(px, botY + 4 * scale, psuW, botH - 8 * scale);
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      for (let vx = px + 6 * scale; vx < px + psuW - 22 * scale; vx += 4.5 * scale) {
        ctx.fillRect(vx, botY + 8 * scale, 2 * scale, botH - 16 * scale);
      }
      ctx.fillStyle = "#5fd97a";
      ctx.beginPath();
      ctx.arc(px + psuW - 10 * scale, botY + botH * 0.5, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "audio" || label === "DAC") {
    // 4U studio mastering DAC / headphone amplifier sub-panel
    const panelX = pad;
    const panelW = faceRight - panelX;
    const panelH = H - pad * 2;
    const pg = ctx.createLinearGradient(0, pad, 0, pad + panelH);
    pg.addColorStop(0, "#21262c");
    pg.addColorStop(0.14, "#191d22");
    pg.addColorStop(1, "#14171b");
    ctx.fillStyle = pg;
    ctx.fillRect(panelX, pad, panelW, panelH);

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 0.8 * scale;
    ctx.strokeRect(panelX + 1.5 * scale, pad + 1.5 * scale, panelW - 3 * scale, panelH - 3 * scale);

    // Engraved top header strip + horizontal section rule separating upper telemetry/toggles and lower I/O stage
    ctx.fillStyle = "rgba(214,221,228,0.58)";
    ctx.font = `500 ${4.6 * scale}px ${CANVAS_MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("REFERENCE MASTERING DAC // 32-BIT · 192kHz", panelX + 8 * scale, pad + 10 * scale);
    ctx.fillStyle = "rgba(224,154,84,0.72)";
    ctx.textAlign = "right";
    ctx.fillText("MODEL DAC-04", faceRight - 8 * scale, pad + 10 * scale);

    const [, divY] = dacLocalToCanvas(0, -3, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.065)";
    ctx.beginPath();
    ctx.moveTo(panelX + 7 * scale, divY);
    ctx.lineTo(faceRight - 7 * scale, divY);
    ctx.stroke();

    // Recessed backing behind the 3D OLED bezel
    const [sx, sy] = dacLocalToCanvas(DAC_LAYOUT.screen.x, DAC_LAYOUT.screen.y, W, H);
    const sw = (DAC_LAYOUT.screen.w / DAC_FACE_W) * W;
    const sh = (DAC_LAYOUT.screen.h / DAC_FACE_H) * H;
    ctx.fillStyle = "#07090c";
    ctx.fillRect(sx - sw * 0.5, sy - sh * 0.5, sw, sh);

    // Toggle switch silkscreen labels & pilot LEDs
    for (let i = 0; i < DAC_LAYOUT.toggles.length; i++) {
      const t = DAC_LAYOUT.toggles[i];
      const [tx, ty] = dacLocalToCanvas(t.x, t.y, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(220,226,232,0.88)";
      ctx.font = `500 ${4.8 * scale}px ${CANVAS_MONO}`;
      ctx.fillText(t.name, tx, ty + 28 * scale);

      ctx.fillStyle = "rgba(210,216,222,0.58)";
      ctx.font = `${4.1 * scale}px ${CANVAS_MONO}`;
      ctx.fillText(t.upTxt, tx, ty - 14 * scale);
      ctx.fillText(t.dnTxt, tx, ty + 18 * scale);

      if (t.led) {
        const ledY = ty - 22 * scale;
        ctx.fillStyle = "#5fd97a";
        ctx.beginPath();
        ctx.arc(tx, ledY, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        if (flicker) {
          leds.push({ ux: tx / W, uy: ledY / H, phase: 0.7 + i, rate: 3.1, w: 3.2, h: 3.2 });
        }
      }
    }

    // Precision radial scales & labels around each rotary knob
    for (const k of DAC_LAYOUT.knobs) {
      const [kx, ky] = dacLocalToCanvas(k.x, k.y, W, H);
      const kr = (k.r / DAC_FACE_W) * W;
      const startA = -Math.PI * 0.78;
      const endA = Math.PI * 0.78;
      for (let t = 0; t < k.ticks; t++) {
        const frac = k.ticks === 1 ? 0.5 : t / (k.ticks - 1);
        const a = startA + frac * (endA - startA) - Math.PI * 0.5;
        const rIn = kr + 2.5 * scale;
        const rOut = kr + (t === 0 || t === k.ticks - 1 || t === Math.floor(k.ticks / 2) ? 6.2 : 4.5) * scale;
        ctx.strokeStyle = k.hero && t >= k.ticks - 2 ? "rgba(224,142,74,0.78)" : "rgba(214,221,228,0.52)";
        ctx.lineWidth = (t === Math.floor(k.ticks / 2) ? 1.15 : 0.85) * scale;
        ctx.beginPath();
        ctx.moveTo(kx + Math.cos(a) * rIn, ky + Math.sin(a) * rIn);
        ctx.lineTo(kx + Math.cos(a) * rOut, ky + Math.sin(a) * rOut);
        ctx.stroke();

        const lbl = k.tickLabels[t];
        if (lbl) {
          const rTxt = kr + 10.5 * scale;
          ctx.fillStyle = "rgba(210,216,222,0.52)";
          ctx.font = `${3.5 * scale}px ${CANVAS_MONO}`;
          ctx.textAlign = "center";
          ctx.fillText(lbl, kx + Math.cos(a) * rTxt, ky + Math.sin(a) * rTxt + 1.2 * scale);
        }
      }
      ctx.fillStyle = "rgba(214,221,228,0.82)";
      ctx.font = `500 ${4.3 * scale}px ${CANVAS_MONO}`;
      ctx.textAlign = "center";
      ctx.fillText(k.name, kx, ky + kr + 16 * scale);
    }

    // Silkscreen rings & captions for 4-pin XLR, 1/4" TRS headphone jack, and Coax/Aux RCAs
    const [xx, xy] = dacLocalToCanvas(DAC_LAYOUT.xlr.x, DAC_LAYOUT.xlr.y, W, H);
    const xr = (DAC_LAYOUT.xlr.r / DAC_FACE_W) * W;
    ctx.fillStyle = "#080a0d";
    ctx.beginPath();
    ctx.arc(xx, xy, xr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(214,221,228,0.75)";
    ctx.font = `500 ${3.9 * scale}px ${CANVAS_MONO}`;
    ctx.textAlign = "center";
    ctx.fillText(DAC_LAYOUT.xlr.name, xx, xy + xr + 11 * scale);

    const [px, py] = dacLocalToCanvas(DAC_LAYOUT.trs.x, DAC_LAYOUT.trs.y, W, H);
    const pr = (DAC_LAYOUT.trs.r / DAC_FACE_W) * W;
    ctx.fillStyle = "rgba(214,221,228,0.75)";
    ctx.fillText(DAC_LAYOUT.trs.name, px, py + pr + 14.5 * scale);

    for (const rca of DAC_LAYOUT.rca) {
      const [rx, ry] = dacLocalToCanvas(rca.x, rca.y, W, H);
      const rr = (rca.r / DAC_FACE_W) * W;
      ctx.strokeStyle = rca.css;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(210,216,222,0.58)";
      ctx.font = `${3.6 * scale}px ${CANVAS_MONO}`;
      ctx.fillText(rca.name, rx, ry + rr + 7.5 * scale);
    }
  } else {
    const caddyW = 26 * scale;
    const gap = 3 * scale;

    // drive caddies (1U, 2U, 4U)
    const count = Math.max(1, Math.min(6, Math.round(u * 1.2)));
    for (let i = 0; i < count; i++) {
      const x = pad + i * (caddyW + gap);
      const y = pad + 2 * scale;
      const h = H - pad * 2 - 4 * scale;

      const cg = ctx.createLinearGradient(x, y, x + caddyW, y);
      cg.addColorStop(0, "#3a4046");
      cg.addColorStop(1, "#23272b");
      ctx.fillStyle = cg;
      ctx.fillRect(x, y, caddyW, h);

      ctx.strokeStyle = "rgba(0,0,0,.75)";
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(x + 0.5, y + 0.5, caddyW - 1, h - 1);

      // activity LED
      const ledX = x + caddyW / 2;
      const ledY = y + 5 * scale;
      ctx.fillStyle = i % 3 === 0 ? "#5fd97a" : "#3f7a4f";
      ctx.beginPath();
      ctx.arc(ledX, ledY, 1.6 * scale, 0, Math.PI * 2);
      ctx.fill();
      if (flicker) {
        leds.push({ ux: ledX / W, uy: ledY / H, phase: i * 1.9 + 0.8, rate: 4.2 + (i % 4) * 1.1 });
      }

      // latch slot
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.fillRect(x + 4 * scale, y + h - 8 * scale, caddyW - 8 * scale, 2 * scale);

      // number
      ctx.fillStyle = "rgba(200,205,210,.45)";
      ctx.font = `${6 * scale}px ${CANVAS_MONO}`;
      ctx.textAlign = "center";
      ctx.fillText(String(i).padStart(2, "0"), x + caddyW / 2, y + h / 2 + 2 * scale);
    }

    // vent field
    const vx = pad + count * (caddyW + gap) + 4 * scale;
    const vw = W * 0.42 - vx;
    if (vw > 8) {
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(vx, pad, vw, H - pad * 2);
      ctx.fillStyle = "rgba(0,0,0,.85)";
      for (let y = pad + 3 * scale; y < H - pad; y += 5 * scale) {
        for (let x = vx + 3 * scale; x < vx + vw - 2; x += 5 * scale) {
          ctx.beginPath();
          ctx.arc(x, y, 1.1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // label plate
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.fillRect(lx, pad, lw, H - pad * 2);

  ctx.textAlign = "left";
  ctx.fillStyle = "#f7f2ea";
  ctx.font = `500 ${10.5 * scale}px ${CANVAS_MONO}`;
  ctx.fillText(label, lx + 5 * scale, H * 0.52);

  ctx.fillStyle = "rgba(214,221,228,.92)";
  ctx.font = `${6.5 * scale}px ${CANVAS_MONO}`;
  ctx.fillText(sub, lx + 5 * scale, H * 0.52 + 10 * scale);

  return { canvas: c, leds };
}

function makeSideTexture(label: string, u: number, unitDepth: number) {
  const c = document.createElement("canvas");
  const scale = 2;
  const W = Math.round(unitDepth * scale);
  const H = Math.round(u * UNIT * scale);
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2b3036");
  g.addColorStop(0.15, "#21252a");
  g.addColorStop(0.85, "#191c20");
  g.addColorStop(1, "#121518");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Stamped sheet-metal panel seams
  const pad = 7 * scale;
  ctx.strokeStyle = "rgba(0,0,0,0.65)";
  ctx.lineWidth = 1.2 * scale;
  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);

  // Vertical structural ribs dividing front bay, mid chassis, rear PSU zone
  const ribXs = unitDepth > 300 ? [W * 0.28, W * 0.68] : [W * 0.5];
  for (const rx of ribXs) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(rx, pad, 2.5 * scale, H - pad * 2);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(rx + 2.5 * scale, pad, 1 * scale, H - pad * 2);
  }

  // Slide rail track recessed groove along the center height
  const railH = Math.min(13 * scale, H * 0.28);
  const railY = H * 0.5 - railH * 0.5;
  ctx.fillStyle = "#101316";
  ctx.fillRect(0, railY, W, railH);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(0, railY, W, 1 * scale);
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, railY + railH - 1 * scale, W, 1 * scale);

  // Side intake louvers on deeper servers (rearward of front rib)
  if (unitDepth > 300 && H >= 44 * scale) {
    const lx0 = W * 0.34;
    const lx1 = W * 0.63;
    const slotW = 3 * scale;
    const slotGap = 6.5 * scale;
    for (const bandY of [pad + 5 * scale, railY + railH + 5 * scale]) {
      const bandH = Math.min(18 * scale, (railY - pad - 10 * scale));
      if (bandH < 6 * scale) continue;
      for (let x = lx0; x < lx1; x += slotGap) {
        ctx.fillStyle = "#080a0c";
        ctx.fillRect(x, bandY, slotW, bandH);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fillRect(x + slotW, bandY, 1 * scale, bandH);
      }
    }
  }

  // Stamped rivets along top & bottom flange
  ctx.fillStyle = "rgba(220,226,232,0.22)";
  for (let x = 22 * scale; x < W - 18 * scale; x += 48 * scale) {
    ctx.beginPath();
    ctx.arc(x, 3.5 * scale, 1.3 * scale, 0, Math.PI * 2);
    ctx.arc(x, H - 3.5 * scale, 1.3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle side chassis marking
  ctx.fillStyle = "rgba(214,221,228,0.26)";
  ctx.font = `${5.5 * scale}px ${CANVAS_MONO}`;
  ctx.textAlign = "left";
  ctx.fillText(`${u}U // ${label}`, 14 * scale, H - 9 * scale);

  return c;
}

function makeFloorTexture(floorSize: number, offsetX: number, offsetZ: number) {
  const c = document.createElement("canvas");
  const W = 2040;
  const H = 2040;
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  const tiles = 12;
  const tilePx = W / tiles; // 170px per ~200x200 world unit (600mm raised tile)
  const worldToCanvas = (wx: number, wz: number): [number, number] => [
    ((wx - offsetX) / floorSize + 0.5) * W,
    ((wz - offsetZ) / floorSize + 0.5) * H,
  ];

  // Cold-aisle airflow grate tiles directly in front of rack & beside right rear service aisle
  const ventTiles = new Set([
    "4,7", "5,7", "6,7", "7,7",
    "4,8", "6,8",
    "8,5",
    "3,6",
  ]);
  // Recessed brush-strip cable floor grommet tile near right-rear service zone
  const grommetTile = "7,4";

  for (let row = 0; row < tiles; row++) {
    for (let col = 0; col < tiles; col++) {
      const tx = col * tilePx;
      const ty = row * tilePx;
      const key = `${col},${row}`;

      // Subtle anti-static laminate value variation per modular panel
      const hash = ((row * 31 + col * 17) % 7) - 3;
      const baseV = 27 + hash * 1.1;
      const grad = ctx.createLinearGradient(tx, ty, tx + tilePx, ty + tilePx);
      grad.addColorStop(0, `rgb(${baseV + 2}, ${baseV + 5}, ${baseV + 9})`);
      grad.addColorStop(1, `rgb(${baseV - 2}, ${baseV + 1}, ${baseV + 5})`);
      ctx.fillStyle = grad;
      ctx.fillRect(tx, ty, tilePx, tilePx);

      // Matte micro-speckle texture across tile top
      ctx.fillStyle = "rgba(255, 255, 255, 0.022)";
      for (let sy = ty + 14; sy < ty + tilePx - 10; sy += 22) {
        for (let sx = tx + 14 + ((sy / 22) % 2) * 11; sx < tx + tilePx - 10; sx += 22) {
          ctx.fillRect(sx, sy, 2, 2);
        }
      }

      if (ventTiles.has(key)) {
        // Die-cast aluminum perimeter collar for perforated cold-aisle airflow grate
        const inset = 11;
        const gx = tx + inset;
        const gy = ty + inset;
        const gw = tilePx - inset * 2;
        const gh = tilePx - inset * 2;

        ctx.fillStyle = "#262c33";
        ctx.fillRect(gx, gy, gw, gh);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.11)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(gx + 0.5, gy + 0.5, gw - 1, gh - 1);

        // Dark underfloor cold-air plenum recess with faint cool steel-cyan depth hint
        const inner = 7;
        const vx = gx + inner;
        const vy = gy + inner;
        const vw = gw - inner * 2;
        const vh = gh - inner * 2;
        const plenum = ctx.createRadialGradient(
          vx + vw * 0.5,
          vy + vh * 0.5,
          6,
          vx + vw * 0.5,
          vy + vh * 0.5,
          vw * 0.72,
        );
        plenum.addColorStop(0, "#10212b");
        plenum.addColorStop(0.55, "#090f14");
        plenum.addColorStop(1, "#050709");
        ctx.fillStyle = plenum;
        ctx.fillRect(vx, vy, vw, vh);

        // 2x2 structural damper cross-ribs + louvered airflow grille slots
        const colsSlot = 8;
        const rowsSlot = 12;
        const padX = 5;
        const padY = 5;
        const slotGapX = 3.5;
        const slotGapY = 3.5;
        const slotW = (vw - padX * 2 - (colsSlot - 1) * slotGapX) / colsSlot;
        const slotH = (vh - padY * 2 - (rowsSlot - 1) * slotGapY) / rowsSlot;

        for (let sr = 0; sr < rowsSlot; sr++) {
          for (let sc = 0; sc < colsSlot; sc++) {
            const sx = vx + padX + sc * (slotW + slotGapX);
            const sy = vy + padY + sr * (slotH + slotGapY);
            // Perforated steel bridge highlight around louver slot
            ctx.fillStyle = "#242a31";
            ctx.fillRect(sx - 1.5, sy - 1.5, slotW + 3, slotH + 3);
            ctx.fillStyle = "rgba(220, 232, 244, 0.12)";
            ctx.fillRect(sx - 1.5, sy - 1.5, slotW + 3, 1);
            // Open vent throat into dark plenum
            ctx.fillStyle = "#040709";
            ctx.fillRect(sx, sy, slotW, slotH);
            ctx.fillStyle = "rgba(110, 168, 196, 0.08)";
            ctx.fillRect(sx + 1, sy + 1, slotW - 2, 1.5);
          }
        }

        // Cross reinforcement mullions splitting grate into 4 quadrants
        ctx.fillStyle = "#252b32";
        ctx.fillRect(vx + vw * 0.5 - 3, vy, 6, vh);
        ctx.fillRect(vx, vy + vh * 0.5 - 3, vw, 6);
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(vx + vw * 0.5 - 3, vy, 1, vh);
        ctx.fillRect(vx, vy + vh * 0.5 - 3, vw, 1);
      } else if (key === grommetTile) {
        // Recessed brushed floor cable pass-through grommet
        const rx = tx + tilePx * 0.28;
        const ry = ty + tilePx * 0.36;
        const rw = tilePx * 0.44;
        const rh = 34;
        ctx.fillStyle = "#242a30";
        ctx.fillRect(rx - 4, ry - 4, rw + 8, rh + 8);
        ctx.fillStyle = "#050708";
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
        ctx.strokeRect(rx - 4, ry - 4, rw + 8, rh + 8);
        // Brush strip fibers
        ctx.fillStyle = "#161a1e";
        for (let bx = rx + 2; bx < rx + rw - 2; bx += 3) {
          ctx.fillRect(bx, ry + 2, 1.5, rh * 0.42);
          ctx.fillRect(bx + 1, ry + rh * 0.56, 1.5, rh * 0.42);
        }
      }

      // Recessed tile joint seam & top/left specular bevel
      ctx.strokeStyle = "#07090b";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(tx, ty, tilePx, tilePx);
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.fillRect(tx + 2, ty + 2, tilePx - 4, 1);
      ctx.fillRect(tx + 2, ty + 2, 1, tilePx - 4);

      // Corner hex leveling lock screws
      const screwOff = 8;
      ctx.fillStyle = "#0b0d10";
      for (const [sx, sy] of [
        [tx + screwOff, ty + screwOff],
        [tx + tilePx - screwOff, ty + screwOff],
        [tx + screwOff, ty + tilePx - screwOff],
        [tx + tilePx - screwOff, ty + tilePx - screwOff],
      ]) {
        ctx.beginPath();
        ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
        ctx.fillRect(sx - 0.8, sy - 0.8, 1.2, 1.2);
        ctx.fillStyle = "#0b0d10";
      }
    }
  }

  // Soft cast ambient occlusion shadow directly beneath the rack footprint & leveling feet
  const [rx0, rz0] = worldToCanvas(-256, -256);
  const [rx1, rz1] = worldToCanvas(256, 256);
  const rackW = rx1 - rx0;
  const rackD = rz1 - rz0;
  const ao = ctx.createRadialGradient(
    (rx0 + rx1) * 0.5,
    (rz0 + rz1) * 0.5,
    rackW * 0.12,
    (rx0 + rx1) * 0.5,
    (rz0 + rz1) * 0.5,
    rackW * 0.92,
  );
  ao.addColorStop(0, "rgba(0, 0, 0, 0.82)");
  ao.addColorStop(0.55, "rgba(0, 0, 0, 0.52)");
  ao.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = ao;
  ctx.fillRect(rx0 - rackW * 0.5, rz0 - rackD * 0.5, rackW * 2, rackD * 2);

  // Soft grounding shadow beneath the stacked HDDs on the right service tile
  const [hx, hz] = worldToCanvas(315, 145);
  const hddAo = ctx.createRadialGradient(hx, hz, 10, hx, hz, tilePx * 0.85);
  hddAo.addColorStop(0, "rgba(0, 0, 0, 0.78)");
  hddAo.addColorStop(0.55, "rgba(0, 0, 0, 0.42)");
  hddAo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = hddAo;
  ctx.fillRect(hx - tilePx, hz - tilePx, tilePx * 2, tilePx * 2);

  // Subtle floor fade around the rack + aisles so the server room floor dissolves cleanly into #0c0e11
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const [fx, fz] = worldToCanvas(110, 100);
  const fade = ctx.createRadialGradient(fx, fz, W * 0.14, fx, fz, W * 0.39);
  fade.addColorStop(0, "rgba(255, 255, 255, 1)");
  fade.addColorStop(0.5, "rgba(255, 255, 255, 0.88)");
  fade.addColorStop(0.78, "rgba(255, 255, 255, 0.25)");
  fade.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  return c;
}

function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? r : r * 0.28;
    const ang = (i * Math.PI) / 4 - Math.PI / 2;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function makeHddTopTexture(isEve: boolean) {
  const c = document.createElement("canvas");
  const W = 280;
  const H = 396;
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // Die-cast brushed aluminum HDD top plate
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#434952");
  g.addColorStop(0.45, "#2f343b");
  g.addColorStop(1, "#202429");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(0,0,0,0.65)";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Subtle spindle hub ring stamp in lower third
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.78, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#1c2025";
  ctx.beginPath();
  ctx.arc(W * 0.5, H * 0.78, 16, 0, Math.PI * 2);
  ctx.fill();

  // Corner Torx fasteners
  for (const [sx, sy] of [
    [18, 18],
    [W - 18, 18],
    [18, H - 18],
    [W - 18, H - 18],
    [18, H * 0.5],
    [W - 18, H * 0.5],
  ]) {
    ctx.fillStyle = "#16191d";
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(sx - 1.5, sy - 1.5, 2, 2);
  }

  // Enterprise drive label sticker
  const lx = 26;
  const ly = 28;
  const lw = W - 52;
  const lh = 204;
  ctx.fillStyle = isEve ? "#ede7de" : "#dad4ca";
  ctx.fillRect(lx, ly, lw, lh);
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(lx, ly, lw, lh);

  if (isEve) {
    // Dark obsidian header band featuring only the sparkle logo + "Eve"
    ctx.fillStyle = "#111418";
    ctx.fillRect(lx, ly, lw, 90);

    // Three-star sparkle emblem (large hero sparkle + 2 smaller accent sparkles)
    drawSparkle(ctx, lx + 44, ly + 45, 22, "#f9d67a");
    drawSparkle(ctx, lx + 68, ly + 28, 9, "#ffe9a8");
    drawSparkle(ctx, lx + 71, ly + 59, 6, "#e0a34a");

    ctx.fillStyle = "#f7f2ea";
    ctx.font = `500 34px ${CANVAS_MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("Eve", lx + 90, ly + 56, lw - 104);

    ctx.fillStyle = "#d46b42";
    ctx.fillRect(lx, ly + 90, lw, 4);

    ctx.fillStyle = "#1c2026";
    ctx.font = `500 12px ${CANVAS_MONO}`;
    ctx.fillText("3.5\" ENTERPRISE · 16TB", lx + 14, ly + 120, lw - 28);

    ctx.fillStyle = "#525862";
    ctx.font = `500 10px ${CANVAS_MONO}`;
    ctx.fillText("7200 RPM · SATA 6Gb/s · 256MB", lx + 14, ly + 140, lw - 28);
    ctx.fillText("512e · S/N EV-0607 · MTBF 2.5M", lx + 14, ly + 157, lw - 28);
  } else {
    ctx.fillStyle = "#262b32";
    ctx.fillRect(lx, ly, lw, 34);
    ctx.fillStyle = "#ede7de";
    ctx.font = `500 13px ${CANVAS_MONO}`;
    ctx.textAlign = "left";
    ctx.fillText("COLD STORAGE // SAS", lx + 14, ly + 22);

    ctx.fillStyle = "#2b3036";
    ctx.font = `500 12px ${CANVAS_MONO}`;
    ctx.fillText("3.5\" ENTERPRISE · 16TB", lx + 14, ly + 64);
    ctx.fillStyle = "#626870";
    ctx.font = `500 11px ${CANVAS_MONO}`;
    ctx.fillText("7200 RPM · ARCHIVAL", lx + 14, ly + 86);
  }

  // Barcode ticks along bottom of sticker
  ctx.fillStyle = "#1c2026";
  for (let bx = lx + 14, idx = 0; bx < lx + lw - 16; bx += 4.5, idx++) {
    const bw = idx % 3 === 0 ? 2.5 : idx % 2 === 0 ? 1.5 : 1;
    ctx.fillRect(bx, ly + lh - 26, bw, 14);
  }

  return c;
}

function sampleCatmullRom(ctrl: Vec3[], segments: number, out: Vec3[]) {
  const n = ctrl.length;
  for (let s = 0; s <= segments; s++) {
    const u = (s / segments) * (n - 1);
    const i = Math.min(n - 2, Math.floor(u));
    const t = u - i;
    const t2 = t * t;
    const t3 = t2 * t;

    const p0 = ctrl[Math.max(0, i - 1)];
    const p1 = ctrl[i];
    const p2 = ctrl[Math.min(n - 1, i + 1)];
    const p3 = ctrl[Math.min(n - 1, i + 2)];

    out[s].set(
      0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      0.5 * (2 * p1.z + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
    );
  }
}

function writeTubeVertices(
  pts: Vec3[],
  radius: number,
  radial: number,
  posArr: Float32Array,
  normArr: Float32Array,
) {
  const count = pts.length;
  const tang = new Vec3();
  const prevN = new Vec3();
  const norm = new Vec3();
  const binorm = new Vec3();
  const ref = new Vec3();
  let v = 0;

  for (let i = 0; i < count; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(count - 1, i + 1)];
    tang.sub(b, a);
    if (tang.len() < 1e-5) tang.set(0, 0, 1);
    else tang.normalize();

    if (i === 0) {
      ref.set(Math.abs(tang.y) > 0.9 ? 1 : 0, Math.abs(tang.y) > 0.9 ? 0 : 1, 0);
      norm.cross(ref, tang).normalize();
    } else {
      const dot = prevN.x * tang.x + prevN.y * tang.y + prevN.z * tang.z;
      norm.set(prevN.x - tang.x * dot, prevN.y - tang.y * dot, prevN.z - tang.z * dot);
      if (norm.len() < 1e-5) {
        ref.set(Math.abs(tang.y) > 0.9 ? 1 : 0, Math.abs(tang.y) > 0.9 ? 0 : 1, 0);
        norm.cross(ref, tang).normalize();
      } else {
        norm.normalize();
      }
    }
    prevN.copy(norm);
    binorm.cross(tang, norm).normalize();

    for (let j = 0; j <= radial; j++) {
      const theta = (j / radial) * Math.PI * 2;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const nx = norm.x * c + binorm.x * s;
      const ny = norm.y * c + binorm.y * s;
      const nz = norm.z * c + binorm.z * s;

      posArr[v * 3] = pts[i].x + nx * radius;
      posArr[v * 3 + 1] = pts[i].y + ny * radius;
      posArr[v * 3 + 2] = pts[i].z + nz * radius;

      normArr[v * 3] = nx;
      normArr[v * 3 + 1] = ny;
      normArr[v * 3 + 2] = nz;
      v++;
    }
  }
}

export function mountRack(
  canvas: HTMLCanvasElement,
  units: RackUnitSpec[],
  opts: Options = {},
): Handle | null {
  const onStats = opts.onStats;
  const onFirstFrame = opts.onFirstFrame;
  let firstFrameSent = false;
  const emitFirstFrame = () => {
    if (firstFrameSent) return;
    firstFrameSent = true;
    onFirstFrame?.();
  };
  const isCompactGpu = window.innerWidth < 960 || window.matchMedia("(pointer: coarse)").matches;
  const maxDpr = isCompactGpu ? 1.5 : 2;
  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, maxDpr) });
  } catch {
    return null;
  }

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 32, near: 1, far: 12000, aspect: 1 });
  camera.position.set(0, 0, 3000); // recomputed on resize to fit the rack
  camera.lookAt(new Vec3(0, 0, 0));
  camera.updateMatrixWorld();

  // OGL's fov value does not map linearly to the vertical half-angle, so derive
  // the real one by projecting a unit-height probe.
  const probe = new Vec3(0, 1, 0).applyMatrix4(camera.projectionViewMatrix);
  const tanHalf = 1 / Math.max(0.0001, probe.y * camera.position.z);

  const SPLIT_ROT_Y = -0.44;
  const FRONT_ROT_Y = -0.04;
  let presentationMode: PresentationMode = opts.initialMode ?? "split";
  let targetRotY = presentationMode === "front" ? FRONT_ROT_Y : SPLIT_ROT_Y;
  let currentRotY = targetRotY;
  let targetPosX = 0;
  let currentPosX = 0;

  const root = new Transform();
  root.position.y = 0;
  root.rotation.y = currentRotY;

  const lightDir = new Vec3(-0.45, 0.7, 0.62).normalize();

  const metalVertex = vertex;
  const metalFragment = fragment;

  // OGL dereferences sampler uniforms every draw, so an empty sampler must
  // still point at a real texture.
  const blank = document.createElement("canvas");
  blank.width = 1;
  blank.height = 1;
  const blankTex = new Texture(gl, { image: blank, generateMipmaps: false });

  const programs: Program[] = [];
  let totalTris = 2; // includes floor plane

  const createMetalProgram = (
    color: [number, number, number],
    map: HTMLCanvasElement | null,
    unlit = false,
    rim = 0.48,
  ) => {
    const program = new Program(gl, {
      vertex: metalVertex,
      fragment: metalFragment,
      uniforms: {
        uColor: { value: color },
        uLightDir: { value: lightDir },
        uLightColor: { value: [1.55, 1.18, 0.85] },
        uAmbient: { value: [0.055, 0.065, 0.085] },
        uFillDir: { value: [0.65, 0.25, 0.5] },
        uFillColor: { value: [0.24, 0.36, 0.56] },
        uRim: { value: rim },
        uGrid: { value: 0 },
        uUseMap: { value: map ? 1 : 0 },
        uMap: { value: blankTex },
        uOpacity: { value: 1 },
        uUnlit: { value: unlit ? 1 : 0 },
        uIsFloor: { value: 0 },
      },
    });
    if (map) {
      const tex = new Texture(gl, { image: map, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
      program.uniforms.uMap.value = tex;
    }
    programs.push(program);
    return program;
  };

  const makeMesh = (
    geoW: number,
    geoH: number,
    geoD: number,
    color: [number, number, number],
    map: HTMLCanvasElement | null,
    unlit = false,
  ) => {
    const geometry = new Box(gl, { width: geoW, height: geoH, depth: geoD });
    const program = createMetalProgram(color, map, unlit);
    totalTris += 12;
    return new Mesh(gl, { geometry, program });
  };

  // Tapered/chamfered Z-aligned cylinder with front & back caps for knobs, toggles, and audio jacks
  const makeCylinderMesh = (
    rBack: number,
    rFront: number,
    depth: number,
    radialSegs: number,
    color: [number, number, number],
    unlit = false,
    rim = 0.14,
  ) => {
    const segs = Math.max(3, radialSegs);
    const hz = depth * 0.5;
    const slope = (rBack - rFront) / Math.max(1e-4, depth);
    const vertCount = (segs + 1) * 2 + (segs + 2) * 2;
    const pos = new Float32Array(vertCount * 3);
    const norm = new Float32Array(vertCount * 3);
    const uv = new Float32Array(vertCount * 2);
    const idx = new Uint16Array(segs * 12);

    let v = 0;
    const pushVert = (x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, vv: number) => {
      pos[v * 3] = x;
      pos[v * 3 + 1] = y;
      pos[v * 3 + 2] = z;
      norm[v * 3] = nx;
      norm[v * 3 + 1] = ny;
      norm[v * 3 + 2] = nz;
      uv[v * 2] = u;
      uv[v * 2 + 1] = vv;
      return v++;
    };

    // Side wall rings: back (-hz) and front (+hz)
    const sideBase = v;
    for (let j = 0; j <= segs; j++) {
      const th = (j / segs) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      const nLen = Math.hypot(c, s, slope) || 1;
      const nx = c / nLen;
      const ny = s / nLen;
      const nz = slope / nLen;
      pushVert(c * rBack, s * rBack, -hz, nx, ny, nz, j / segs, 0);
      pushVert(c * rFront, s * rFront, hz, nx, ny, nz, j / segs, 1);
    }

    // Front (+Z) cap center + rim, Back (-Z) cap center + rim
    const frontCenter = pushVert(0, 0, hz, 0, 0, 1, 0.5, 0.5);
    const frontStart = v;
    for (let j = 0; j <= segs; j++) {
      const th = (j / segs) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      pushVert(c * rFront, s * rFront, hz, 0, 0, 1, 0.5 + 0.5 * c, 0.5 + 0.5 * s);
    }

    const backCenter = pushVert(0, 0, -hz, 0, 0, -1, 0.5, 0.5);
    const backStart = v;
    for (let j = 0; j <= segs; j++) {
      const th = (j / segs) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      pushVert(c * rBack, s * rBack, -hz, 0, 0, -1, 0.5 + 0.5 * c, 0.5 + 0.5 * s);
    }

    let k = 0;
    for (let j = 0; j < segs; j++) {
      const b0 = sideBase + j * 2;
      const f0 = b0 + 1;
      const b1 = b0 + 2;
      const f1 = b0 + 3;
      idx[k++] = b0;
      idx[k++] = b1;
      idx[k++] = f0;
      idx[k++] = b1;
      idx[k++] = f1;
      idx[k++] = f0;

      idx[k++] = frontCenter;
      idx[k++] = frontStart + j;
      idx[k++] = frontStart + j + 1;

      idx[k++] = backCenter;
      idx[k++] = backStart + j + 1;
      idx[k++] = backStart + j;
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: pos },
      normal: { size: 3, data: norm },
      uv: { size: 2, data: uv },
      index: { data: idx },
    });
    const program = createMetalProgram(color, null, unlit, rim);
    totalTris += segs * 4;
    return new Mesh(gl, { geometry, program });
  };

  const makeCable = (
    ctrl: Vec3[],
    radius: number,
    color: [number, number, number],
    opts: { segments?: number; radial?: number; parent?: Transform } = {},
  ) => {
    const segments = opts.segments ?? 18;
    const radial = opts.radial ?? 6;
    const ringCount = segments + 1;
    const stride = radial + 1;
    const vertCount = ringCount * stride;

    const pts = Array.from({ length: ringCount }, () => new Vec3());
    const posArr = new Float32Array(vertCount * 3);
    const normArr = new Float32Array(vertCount * 3);
    const uvArr = new Float32Array(vertCount * 2);
    const idxArr = new Uint16Array(segments * radial * 6);

    for (let i = 0; i < ringCount; i++) {
      for (let j = 0; j < stride; j++) {
        const idx = (i * stride + j) * 2;
        uvArr[idx] = j / radial;
        uvArr[idx + 1] = i / segments;
      }
    }

    let k = 0;
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * stride + j;
        const b = (i + 1) * stride + j;
        const c = (i + 1) * stride + (j + 1);
        const d = i * stride + (j + 1);
        idxArr[k++] = a;
        idxArr[k++] = b;
        idxArr[k++] = d;
        idxArr[k++] = b;
        idxArr[k++] = c;
        idxArr[k++] = d;
      }
    }

    sampleCatmullRom(ctrl, segments, pts);
    writeTubeVertices(pts, radius, radial, posArr, normArr);

    const geometry = new Geometry(gl, {
      position: { size: 3, data: posArr },
      normal: { size: 3, data: normArr },
      uv: { size: 2, data: uvArr },
      index: { data: idxArr },
    });
    const program = createMetalProgram(color, null, false, 0.14);
    totalTris += segments * radial * 2;
    const mesh = new Mesh(gl, { geometry, program });
    (opts.parent ?? root).addChild(mesh);

    return {
      mesh,
      update(nextCtrl: Vec3[]) {
        sampleCatmullRom(nextCtrl, segments, pts);
        writeTubeVertices(pts, radius, radial, posArr, normArr);
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
      },
    };
  };

  const chassis: {
    mesh: Mesh;
    slot: Mesh;
    uidLed: Mesh;
    uidLevel: number;
    spec: RackUnitSpec;
    baseY: number;
    baseZ: number;
    h: number;
    depth: number;
    ej: number;
    onEject?: (slide: number, tilt: number) => void;
  }[] = [];
  const flickerLeds: { mesh: Mesh; unitIdx: number; phase: number; rate: number }[] = [];
  const dacDisplays: { unitIdx: number; draw: (tSec: number, ejLevel: number) => void }[] = [];
  let lastDacDrawMs = 0;

  // Builds the 3D controls & live oscilloscope OLED display onto the 4U studio DAC front panel
  const buildDacHardware = (faceMesh: Mesh, unitIdx: number) => {
    const zBase = 0.5;

    // Recessed OLED bezel + live dynamic waveform Texture (single Plane well forward of bezel to avoid z-fighting)
    const scr = DAC_LAYOUT.screen;
    const outerBezel = makeMesh(scr.w + 4, scr.h + 4, 2.0, [0.065, 0.075, 0.09], null);
    outerBezel.position.set(scr.x, scr.y, zBase + 1.0);
    faceMesh.addChild(outerBezel);

    const oledCanvas = document.createElement("canvas");
    oledCanvas.width = 256;
    oledCanvas.height = 104;
    const octx = oledCanvas.getContext("2d")!;
    const oledGeo = new Plane(gl, { width: scr.w - 4, height: scr.h - 4 });
    const oledProg = createMetalProgram([1, 1, 1], oledCanvas, true, 0);
    totalTris += 2;
    const oledMesh = new Mesh(gl, { geometry: oledGeo, program: oledProg });
    oledMesh.position.set(scr.x, scr.y, zBase + 3.0);
    faceMesh.addChild(oledMesh);
    const oledTex = oledProg.uniforms.uMap.value as Texture;

    const drawWaveform = (tSec: number, ejLevel: number) => {
      const OW = oledCanvas.width;
      const OH = oledCanvas.height;
      octx.fillStyle = "#06090c";
      octx.fillRect(0, 0, OW, OH);

      // Subtle dark satin inner rim around the OLED glass
      octx.strokeStyle = "#262c34";
      octx.lineWidth = 3;
      octx.strokeRect(1.5, 1.5, OW - 3, OH - 3);

      // Faint oscilloscope grid divisions
      octx.strokeStyle = "rgba(110, 210, 145, 0.1)";
      octx.lineWidth = 1;
      for (let gx = 32; gx < OW - 16; gx += 32) {
        octx.beginPath();
        octx.moveTo(gx, 24);
        octx.lineTo(gx, OH - 10);
        octx.stroke();
      }
      const midY = 62;
      octx.beginPath();
      octx.moveTo(10, midY);
      octx.lineTo(OW - 10, midY);
      octx.stroke();

      // Top telemetry strip
      octx.fillStyle = "#88af9e";
      octx.font = `500 10px ${CANVAS_MONO}`;
      octx.textAlign = "left";
      octx.fillText("192kHz / 32B", 12, 16);

      octx.fillStyle = "#5fd97a";
      octx.textAlign = "right";
      octx.fillText("PCM · LOCK", OW - 12, 16);

      // Simple smooth looping scrolling wave across the display
      const phase = tSec * 4.2;
      const amp = 18 + ejLevel * 7;
      const drawLoopWave = (shift: number, stroke: string, width: number) => {
        octx.strokeStyle = stroke;
        octx.lineWidth = width;
        octx.beginPath();
        for (let x = 12; x <= OW - 12; x += 3) {
          const u = (x - 12) / (OW - 24);
          const env = 0.25 + 0.75 * Math.sin(u * Math.PI);
          const wave =
            Math.sin(u * Math.PI * 5 - phase + shift) * 0.65 +
            Math.sin(u * Math.PI * 10 - phase * 1.5 + shift * 1.4) * 0.35;
          const y = midY + wave * amp * env;
          if (x === 12) octx.moveTo(x, y);
          else octx.lineTo(x, y);
        }
        octx.stroke();
      };

      drawLoopWave(1.1, "rgba(102, 214, 145, 0.42)", 1.6);
      drawLoopWave(0, "rgba(238, 156, 78, 0.28)", 4.6);
      drawLoopWave(0, "#f2ab61", 2.1);

      oledTex.needsUpdate = true;
    };

    drawWaveform(0.9, 0.75);
    dacDisplays.push({ unitIdx, draw: drawWaveform });

    // Precision machined rotary knobs (skirt + chamfered knurled body + brushed cap + copper/ember indicator bar)
    for (const k of DAC_LAYOUT.knobs) {
      const skirt = makeCylinderMesh(k.r + 1.2, k.r, 2.5, 24, [0.1, 0.115, 0.135]);
      skirt.position.set(k.x, k.y, zBase + 1.25);
      faceMesh.addChild(skirt);

      const barrel = makeCylinderMesh(k.r * 0.94, k.r * 0.87, k.d, k.hero ? 28 : 22, [0.22, 0.25, 0.29], false, 0.18);
      barrel.position.set(k.x, k.y, zBase + 2.4 + k.d * 0.5);
      faceMesh.addChild(barrel);

      const cap = makeCylinderMesh(k.r * 0.72, k.r * 0.69, 1.2, 22, [0.32, 0.35, 0.39]);
      cap.position.set(k.x, k.y, zBase + 2.4 + k.d + 0.55);
      faceMesh.addChild(cap);

      const dialPivot = new Transform();
      dialPivot.position.set(k.x, k.y, zBase + 2.4 + k.d + 1.15);
      dialPivot.rotation.z = -k.angle;
      faceMesh.addChild(dialPivot);

      const ptr = makeMesh(k.hero ? 2.1 : 1.5, k.r * 0.54, 1.6, [0.88, 0.48, 0.22], null);
      ptr.position.set(0, k.r * 0.42, 0);
      dialPivot.addChild(ptr);
    }

    // Bat-handle toggle switches (washer + hex nut + angled stainless lever)
    for (const t of DAC_LAYOUT.toggles) {
      const washer = makeCylinderMesh(5.3, 5.1, 1.1, 16, [0.09, 0.1, 0.12]);
      washer.position.set(t.x, t.y, zBase + 0.55);
      faceMesh.addChild(washer);

      const hexNut = makeCylinderMesh(4.0, 3.9, 2.8, 6, [0.46, 0.49, 0.54]);
      hexNut.position.set(t.x, t.y, zBase + 2.1);
      faceMesh.addChild(hexNut);

      const pivot = new Transform();
      pivot.position.set(t.x, t.y, zBase + 3.0);
      pivot.rotation.x = t.up ? -0.55 : 0.55;
      faceMesh.addChild(pivot);

      const bat = makeCylinderMesh(1.1, 1.95, 14.0, 12, [0.64, 0.68, 0.74]);
      bat.position.set(0, 0, 6.8);
      pivot.addChild(bat);

      const tip = makeCylinderMesh(1.95, 0.9, 1.6, 12, [0.72, 0.76, 0.82]);
      tip.position.set(0, 0, 14.5);
      pivot.addChild(tip);
    }

    // Balanced 4-pin Neutrik-style XLR headphone jack + gold pins
    const xlr = DAC_LAYOUT.xlr;
    const xlrFlange = makeCylinderMesh(xlr.r, xlr.r * 0.95, 2.6, 20, [0.08, 0.09, 0.11]);
    xlrFlange.position.set(xlr.x, xlr.y, zBase + 1.3);
    faceMesh.addChild(xlrFlange);

    const xlrBezel = makeCylinderMesh(xlr.r * 0.82, xlr.r * 0.8, 3.8, 20, [0.44, 0.48, 0.53]);
    xlrBezel.position.set(xlr.x, xlr.y, zBase + 1.9);
    faceMesh.addChild(xlrBezel);

    const xlrCore = makeCylinderMesh(xlr.r * 0.65, xlr.r * 0.65, 4.0, 16, [0.02, 0.024, 0.03]);
    xlrCore.position.set(xlr.x, xlr.y, zBase + 2.0);
    faceMesh.addChild(xlrCore);

    const xlrLatch = makeMesh(4.2, 2.6, 2.8, [0.56, 0.6, 0.65], null);
    xlrLatch.position.set(xlr.x, xlr.y + xlr.r * 0.86, zBase + 2.2);
    faceMesh.addChild(xlrLatch);

    for (const [px, py] of [
      [-2.8, 2.2],
      [2.8, 2.2],
      [-2.2, -2.8],
      [2.2, -2.8],
    ]) {
      const pin = makeCylinderMesh(0.95, 0.85, 4.3, 8, [0.85, 0.67, 0.27]);
      pin.position.set(xlr.x + px, xlr.y + py, zBase + 2.15);
      faceMesh.addChild(pin);
    }

    // 1/4" TRS unbalanced headphone jack with hex nut & machined brass sleeve
    const trs = DAC_LAYOUT.trs;
    const trsNut = makeCylinderMesh(trs.r, trs.r, 2.5, 6, [0.38, 0.41, 0.46]);
    trsNut.position.set(trs.x, trs.y, zBase + 1.25);
    faceMesh.addChild(trsNut);

    const trsGold = makeCylinderMesh(trs.r * 0.78, trs.r * 0.75, 4.0, 18, [0.84, 0.64, 0.25]);
    trsGold.position.set(trs.x, trs.y, zBase + 2.0);
    faceMesh.addChild(trsGold);

    const trsBore = makeCylinderMesh(trs.r * 0.43, trs.r * 0.43, 4.3, 12, [0.015, 0.018, 0.022]);
    trsBore.position.set(trs.x, trs.y, zBase + 2.15);
    faceMesh.addChild(trsBore);

    // Dual Coax / Aux RCA jacks
    for (const rca of DAC_LAYOUT.rca) {
      const col = makeCylinderMesh(rca.r, rca.r, 2.2, 6, [0.34, 0.37, 0.42]);
      col.position.set(rca.x, rca.y, zBase + 1.1);
      faceMesh.addChild(col);

      const ins = makeCylinderMesh(rca.r * 0.78, rca.r * 0.75, 4.2, 14, rca.ring);
      ins.position.set(rca.x, rca.y, zBase + 2.1);
      faceMesh.addChild(ins);

      const tip = makeCylinderMesh(rca.r * 0.48, rca.r * 0.44, 5.0, 12, [0.84, 0.65, 0.26]);
      tip.position.set(rca.x, rca.y, zBase + 2.5);
      faceMesh.addChild(tip);

      const bore = makeCylinderMesh(rca.r * 0.24, rca.r * 0.24, 5.3, 8, [0.015, 0.018, 0.022]);
      bore.position.set(rca.x, rca.y, zBase + 2.65);
      faceMesh.addChild(bore);
    }
  };
  let cursor = 0;
  const frontZ = RACK_DEPTH / 2;

  // 4-post deep rack cabinet frame (front + rear posts + depth cross-braces)
  const postGeoW = 11;
  const postGeoD = 16;
  const totalH = units.reduce((n, u) => n + u.u, 0) * UNIT;
  const floorY = -totalH / 2 - 22;

  // Raised modular server room tile floor with cold-aisle airflow vents & caster feet
  const floorSize = 2400;
  const floorOffsetX = -40;
  const floorOffsetZ = 140;
  const floorTexCanvas = makeFloorTexture(floorSize, floorOffsetX, floorOffsetZ);
  const floorTex = new Texture(gl, {
    image: floorTexCanvas,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });
  const floorProg = new Program(gl, {
    vertex: metalVertex,
    fragment: metalFragment,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: [1, 1, 1] },
      uLightDir: { value: lightDir },
      uLightColor: { value: [1.35, 1.06, 0.8] },
      uAmbient: { value: [0.095, 0.11, 0.135] },
      uFillDir: { value: [0.65, 0.25, 0.5] },
      uFillColor: { value: [0.24, 0.36, 0.56] },
      uRim: { value: 0.08 },
      uGrid: { value: 0 },
      uUseMap: { value: 1 },
      uMap: { value: floorTex },
      uOpacity: { value: 1 },
      uUnlit: { value: 0 },
      uIsFloor: { value: 1 },
    },
  });
  programs.push(floorProg);
  const floorMesh = new Mesh(gl, {
    geometry: new Plane(gl, { width: floorSize, height: floorSize }),
    program: floorProg,
  });
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(floorOffsetX, floorY, floorOffsetZ);
  root.addChild(floorMesh);

  for (const side of [-1, 1]) {
    const px = side * (WIDTH / 2 + 22);
    for (const zSide of [-1, 1]) {
      const pz = zSide * (RACK_DEPTH / 2 - 14);
      const post = makeMesh(postGeoW, totalH + 12, postGeoD, [0.1, 0.115, 0.135], null);
      post.position.set(px, 0, pz);
      root.addChild(post);

      // Heavy-duty leveling foot + floor pad anchoring each rack post to the raised floor
      const leg = makeMesh(9, 14, 9, [0.22, 0.24, 0.27], null);
      leg.position.set(px, floorY + 11, pz);
      root.addChild(leg);

      const footPad = makeMesh(26, 4.5, 26, [0.075, 0.085, 0.095], null);
      footPad.position.set(px, floorY + 2.25, pz);
      root.addChild(footPad);
    }
    // Top, mid, and bottom depth rails connecting front posts to rear posts
    for (const yFrac of [-0.5, -0.15, 0.2, 0.5]) {
      const brace = makeMesh(8, 9, RACK_DEPTH - 12, [0.09, 0.105, 0.125], null);
      brace.position.set(px, yFrac * totalH, 0);
      root.addChild(brace);
    }
  }
  // Top/bottom rear tie bars bridging left and right rear posts
  for (const ySide of [-1, 1]) {
    const tie = makeMesh(WIDTH + 44, 10, 12, [0.09, 0.105, 0.125], null);
    tie.position.set(0, ySide * (totalH / 2 + 2), -RACK_DEPTH / 2 + 14);
    root.addChild(tie);
  }

  // Archive stack of 3 enterprise 3.5" HDDs + 1 leaning hero drive ("EVE") on the right floor tile
  const hddGroup = new Transform();
  hddGroup.position.set(304, floorY, 128);
  hddGroup.rotation.y = 0.24;
  root.addChild(hddGroup);

  const hddW = 92;
  const hddH = 22;
  const hddD = 132;
  const archiveHddTex = makeHddTopTexture(false);
  const eveHddTex = makeHddTopTexture(true);

  const buildHdd = (isEve: boolean) => {
    const drive = makeMesh(hddW, hddH, hddD, [0.12, 0.135, 0.16], null);
    const plate = makeMesh(hddW * 0.96, 1, hddD * 0.96, [1, 1, 1], isEve ? eveHddTex : archiveHddTex);
    plate.position.set(0, hddH / 2 + 0.55, 0);
    drive.addChild(plate);

    // Subtle brushed rail trim along the SATA connector edge
    const trim = makeMesh(hddW * 0.72, 4, 2.5, [0.22, 0.25, 0.3], null);
    trim.position.set(0, -3, hddD / 2 + 0.5);
    drive.addChild(trim);
    return drive;
  };

  const stackPos: [number, number, number, number][] = [
    [-8, hddH / 2, 0, 0.08],
    [-12, hddH * 1.5, 4, -0.07],
    [-6, hddH * 2.5, -2, 0.05],
  ];
  for (const [sx, sy, sz, syRot] of stackPos) {
    const hdd = buildHdd(false);
    hdd.position.set(sx, sy, sz);
    hdd.rotation.y = syRot;
    hddGroup.addChild(hdd);
  }

  // 4th top drive ("EVE"): sits stacked on top by default, tips & falls to lean on hover
  const eveHdd = buildHdd(true);
  hddGroup.addChild(eveHdd);

  const eveLed = makeMesh(5, 0.9, 5, [0.88, 0.68, 0.28], null, true);
  eveLed.position.set(30, hddH / 2 + 0.85, -46);
  eveHdd.addChild(eveLed);

  // Subtle front-bezel gold indicator so EVE stands out atop the 4-drive stack before hover
  const eveFrontLed = makeMesh(14, 2.8, 1.2, [0.88, 0.68, 0.28], null, true);
  eveFrontLed.position.set(-22, 3, hddD / 2 + 0.65);
  eveHdd.addChild(eveFrontLed);

  const floorContactY = (rx: number) => (hddD / 2) * Math.sin(rx) + (hddH / 2) * Math.cos(rx);
  const stackRest = { x: -8, y: 77, z: 2, rx: 0, ry: -0.05, rz: 0 };
  const leanRestRx = 0.95;
  const leanRest = { x: 16, y: floorContactY(leanRestRx), z: 70, rx: leanRestRx, ry: 0, rz: 0 };

  type HddMode = "stacked" | "falling" | "fallen" | "returning";
  const hddSim = {
    mode: "stacked" as HddMode,
    x: stackRest.x,
    y: stackRest.y,
    z: stackRest.z,
    rx: stackRest.rx,
    ry: stackRest.ry,
    rz: stackRest.rz,
    vx: 0,
    vy: 0,
    vz: 0,
    omegaX: 0,
    freeFall: false,
    onFloor: false,
    retT: 0,
    retStart: { x: stackRest.x, y: stackRest.y, z: stackRest.z, rx: stackRest.rx, ry: stackRest.ry, rz: stackRest.rz },
  };

  const syncEvePose = () => {
    eveHdd.position.set(hddSim.x, hddSim.y, hddSim.z);
    eveHdd.rotation.set(hddSim.rx, hddSim.ry, hddSim.rz);
  };
  syncEvePose();

  const stepHddPhysics = (dt: number, hoverOn: boolean) => {
    if (reduce) {
      const dst = hoverOn ? leanRest : stackRest;
      hddSim.mode = hoverOn ? "fallen" : "stacked";
      Object.assign(hddSim, dst);
      syncEvePose();
      return;
    }

    if (hoverOn && (hddSim.mode === "stacked" || hddSim.mode === "returning")) {
      // Launch rigid-body push forward off the top of the stack
      hddSim.mode = "falling";
      hddSim.vx = 38;
      hddSim.vy = 0;
      hddSim.vz = 145;
      hddSim.omegaX = 0;
      hddSim.freeFall = false;
      hddSim.onFloor = false;
    } else if (!hoverOn && (hddSim.mode === "falling" || hddSim.mode === "fallen")) {
      // Capture current pose and lift neatly back onto the stack (never replay fall backwards)
      hddSim.mode = "returning";
      hddSim.retT = 0;
      hddSim.retStart = {
        x: hddSim.x,
        y: hddSim.y,
        z: hddSim.z,
        rx: hddSim.rx,
        ry: hddSim.ry,
        rz: hddSim.rz,
      };
    }

    if (hddSim.mode === "returning") {
      hddSim.retT = Math.min(1, hddSim.retT + dt / 0.55);
      const u = smoothstep01(0, 1, hddSim.retT);
      const rs = hddSim.retStart;
      hddSim.x = rs.x + (stackRest.x - rs.x) * u;
      hddSim.y = rs.y + (stackRest.y - rs.y) * u + Math.sin(u * Math.PI) * 24;
      hddSim.z = rs.z + (stackRest.z - rs.z) * u;
      hddSim.rx = rs.rx + (stackRest.rx - rs.rx) * u;
      hddSim.ry = rs.ry + (stackRest.ry - rs.ry) * u;
      hddSim.rz = rs.rz + (stackRest.rz - rs.rz) * u;
      if (hddSim.retT >= 1) hddSim.mode = "stacked";
      syncEvePose();
      return;
    }

    if (hddSim.mode !== "falling") return;

    const steps = 4;
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      if (!hddSim.freeFall) {
        hddSim.x += hddSim.vx * h;
        hddSim.z += hddSim.vz * h;
        hddSim.vx *= Math.pow(0.85, h);
        hddSim.vz = Math.max(115, hddSim.vz * Math.pow(0.95, h));
        if (hddSim.z > 14) {
          const over = Math.min(1, (hddSim.z - 14) / 48);
          hddSim.omegaX += (2.5 + 16 * over * over) * h;
          hddSim.rx = Math.min(0.82, hddSim.rx + hddSim.omegaX * h);
          const yLip = 66 + (hddH / 2) * Math.cos(hddSim.rx) - Math.min(0, hddSim.z - 52) * 0.25 * Math.sin(hddSim.rx);
          hddSim.y = Math.max(floorContactY(hddSim.rx), yLip);
        }
        if (hddSim.z >= 58) {
          hddSim.freeFall = true;
          hddSim.vz *= 0.55;
          hddSim.vy = -95;
        }
      } else if (!hddSim.onFloor) {
        hddSim.vy -= 1400 * h;
        hddSim.x += hddSim.vx * h;
        hddSim.y += hddSim.vy * h;
        hddSim.z += hddSim.vz * h;
        hddSim.vx *= Math.pow(0.25, h);
        hddSim.vz *= Math.pow(0.2, h);
        hddSim.omegaX += (1.02 - hddSim.rx) * 14 * h;
        hddSim.omegaX *= Math.pow(0.45, h);
        hddSim.rx = Math.min(1.05, hddSim.rx + hddSim.omegaX * h);
        hddSim.ry += (0 - hddSim.ry) * Math.min(1, 5 * h);
        hddSim.rz += (0 - hddSim.rz) * Math.min(1, 5 * h);
        const yFloor = floorContactY(hddSim.rx);
        if (hddSim.y <= yFloor) {
          hddSim.y = yFloor;
          hddSim.onFloor = true;
          hddSim.vy = Math.max(0, -hddSim.vy * 0.16);
          hddSim.omegaX = Math.max(-0.8, Math.min(1.2, hddSim.omegaX * 0.55));
        }
      } else {
        if (hddSim.y > floorContactY(hddSim.rx) + 0.01 || hddSim.vy > 0.5) {
          hddSim.vy -= 1400 * h;
          hddSim.y += hddSim.vy * h;
          if (hddSim.y <= floorContactY(hddSim.rx)) {
            hddSim.y = floorContactY(hddSim.rx);
            hddSim.vy = 0;
          }
        }
        hddSim.omegaX += (leanRestRx - hddSim.rx) * 42 * h - hddSim.omegaX * 7.5 * h;
        hddSim.rx = Math.max(0.75, Math.min(1.04, hddSim.rx + hddSim.omegaX * h));
        hddSim.y = hddSim.vy === 0 ? floorContactY(hddSim.rx) : Math.max(hddSim.y, floorContactY(hddSim.rx));
        hddSim.x += (leanRest.x - hddSim.x) * Math.min(1, 8 * h);
        hddSim.z += (leanRest.z - hddSim.z) * Math.min(1, 10 * h);
        hddSim.ry += (0 - hddSim.ry) * Math.min(1, 10 * h);
        hddSim.rz += (0 - hddSim.rz) * Math.min(1, 10 * h);
        if (
          Math.abs(hddSim.rx - leanRestRx) < 0.004 &&
          Math.abs(hddSim.omegaX) < 0.015 &&
          Math.abs(hddSim.z - leanRest.z) < 0.1
        ) {
          Object.assign(hddSim, leanRest);
          hddSim.mode = "fallen";
          break;
        }
      }
    }
    syncEvePose();
  };

  let hddHoverTarget = 0;
  let lastHddMs = performance.now();
  const setHddHover = (on: boolean) => {
    hddHoverTarget = on ? 1 : 0;
  };

  for (const spec of units) {
    const h = spec.u * UNIT;
    // Standard servers run full cabinet depth (~460); 1U gateway/media bays are shallower appliances
    const unitDepth =
      spec.kind === "network" || spec.label === "PATCH" || spec.label === "GATEWAY"
        ? 165
        : spec.kind === "appliance" || spec.label === "PHOTO" || spec.label === "DAM"
          ? 210
          : 460;
    const baseZ = frontZ - unitDepth / 2;
    const { canvas: face, leds } = makeFaceTexture(spec.label, spec.sub, spec.u, spec.kind, Boolean(spec.flicker));
    const sideTex = makeSideTexture(spec.label, spec.u, unitDepth);

    // chassis body
    const mesh = makeMesh(WIDTH, h, unitDepth, [0.15, 0.17, 0.2], null);
    const y = totalH / 2 - cursor - h / 2;
    mesh.position.set(0, y, baseZ);
    root.addChild(mesh);

    // Printed face (child of chassis)
    const faceMesh = makeMesh(WIDTH * 0.995, h * 0.98, 1, [1, 1, 1], face);
    faceMesh.position.set(0, 0, unitDepth / 2 + 0.6);
    mesh.addChild(faceMesh);

    // Top-right UID navigation beacon (glows cool blue when the unit is hovered for selection)
    const uidX = WIDTH * 0.995 * 0.5 - 22;
    const uidY = h * 0.98 * 0.5 - 12;
    const uidBezel = makeMesh(11, 4.6, 0.5, [0.06, 0.07, 0.085], null);
    uidBezel.position.set(uidX, uidY, 0.55);
    faceMesh.addChild(uidBezel);

    const uidLed = makeMesh(8.4, 2.4, 0.85, [0.1, 0.13, 0.18], null, true);
    uidLed.position.set(uidX, uidY, 0.72);
    faceMesh.addChild(uidLed);

    // Occasional flickering green activity LEDs mounted flush on the front face
    const unitIdx = chassis.length;
    for (const led of leds) {
      const ledMesh = makeMesh(led.w ?? 3.4, led.h ?? 3.4, 0.5, [0.2, 0.49, 0.27], null, true);
      ledMesh.position.set((led.ux - 0.5) * WIDTH * 0.995, (0.5 - led.uy) * h * 0.98, 0.65);
      faceMesh.addChild(ledMesh);
      flickerLeds.push({ mesh: ledMesh, unitIdx, phase: led.phase, rate: led.rate });
    }

    if (spec.kind === "audio" || spec.label === "DAC") {
      buildDacHardware(faceMesh, unitIdx);
    }

    // Detailed right (+X) side wall (exposed to the camera as drawer extends)
    const sideMesh = makeMesh(1, h * 0.96, unitDepth * 0.98, [1, 1, 1], sideTex);
    sideMesh.position.set(WIDTH / 2 + 0.6, 0, 0);
    mesh.addChild(sideMesh);

    // Front-left port lip where content extrudes out of the chassis
    const slot = makeMesh(3.5, h * 0.88, 6, [0.16, 0.18, 0.2], null);
    slot.position.set(-WIDTH / 2 - 1.2, 0, unitDepth / 2 - 2);
    mesh.addChild(slot);

    // Dual telescoping side rail runners reaching deep into the rack cabinet
    for (const side of [-1, 1]) {
      const outerRail = makeMesh(3.5, 9, RACK_DEPTH - 24, [0.24, 0.27, 0.31], null);
      outerRail.position.set(side * (WIDTH / 2 + 7), y, 0);
      root.addChild(outerRail);

      const innerRail = makeMesh(3, 6, unitDepth * 0.95, [0.36, 0.4, 0.44], null);
      innerRail.position.set(side * (WIDTH / 2 + 3), 0, -unitDepth * 0.04);
      mesh.addChild(innerRail);
    }

    // Deep recessed bay cavity behind unit
    const cavity = makeMesh(WIDTH * 0.99, h * 0.96, 4, [0.02, 0.024, 0.03], null);
    cavity.position.set(0, y, -RACK_DEPTH / 2 + 8);
    root.addChild(cavity);

    chassis.push({ mesh, slot, uidLed, uidLevel: 0, spec, baseY: y, baseZ, h, depth: unitDepth, ej: 0 });
    cursor += h;
  }

  // fake contact shadow under each chassis
  for (const c of chassis) {
    const shadow = makeMesh(WIDTH * 1.02, 1, 2, [0.0, 0.0, 0.0], null);
    shadow.position.set(0, c.baseY - c.h / 2 - 1, frontZ + 1);
    root.addChild(shadow);
  }

  // Controlled-chaos server cabling: vertical trunks, dynamic rear umbilicals,
  // GATEWAY front patch jumpers/uplinks, and raised-floor conduits.
  const trunkX = WIDTH / 2 + 10; // just inside the right rear post (exposed to camera)
  const trunkZ = -RACK_DEPTH / 2 + 30;
  const vTop = totalH / 2 - 18;

  // Vertical trunk risers running down the right rear channel (+1 thinner left trunk)
  makeCable(
    [
      new Vec3(trunkX, vTop, trunkZ),
      new Vec3(trunkX + 2, totalH * 0.16, trunkZ + 5),
      new Vec3(trunkX - 3, -totalH * 0.12, trunkZ - 2),
      new Vec3(trunkX + 2, -totalH * 0.36, trunkZ + 4),
      new Vec3(trunkX, floorY + 8, trunkZ),
    ],
    5.2,
    [0.08, 0.09, 0.105],
    { segments: 24, radial: 6 },
  );
  makeCable(
    [
      new Vec3(trunkX - 6, vTop - 22, trunkZ + 8),
      new Vec3(trunkX - 3, totalH * 0.2, trunkZ + 13),
      new Vec3(trunkX - 9, -totalH * 0.08, trunkZ + 5),
      new Vec3(trunkX - 4, -totalH * 0.34, trunkZ + 11),
      new Vec3(trunkX - 7, floorY + 14, trunkZ + 6),
    ],
    3.6,
    [0.14, 0.155, 0.18],
    { segments: 22, radial: 6 },
  );
  makeCable(
    [
      new Vec3(trunkX + 4, vTop - 60, trunkZ + 10),
      new Vec3(trunkX - 4, totalH * 0.06, trunkZ + 15),
      new Vec3(trunkX + 5, -totalH * 0.22, trunkZ + 8),
      new Vec3(trunkX - 2, floorY + 32, trunkZ + 14),
    ],
    2.6,
    [0.64, 0.3, 0.19],
    { segments: 20, radial: 6 },
  );
  makeCable(
    [
      new Vec3(-WIDTH / 2 - 10, vTop - 40, trunkZ + 4),
      new Vec3(-WIDTH / 2 - 8, 0, trunkZ + 9),
      new Vec3(-WIDTH / 2 - 11, floorY + 12, trunkZ + 4),
    ],
    4.0,
    [0.08, 0.09, 0.105],
    { segments: 18, radial: 6 },
  );

  // Small velcro cable-tie straps clamping the right vertical bundle to the side rails
  for (const tieY of [totalH * 0.34, totalH * 0.05, -totalH * 0.24, -totalH * 0.44]) {
    const strap = makeMesh(18, 5, 16, [0.055, 0.06, 0.07], null);
    strap.position.set(trunkX - 1, tieY, trunkZ + 5);
    root.addChild(strap);
  }

  const EJECT = 200;

  // Dynamic rear slack umbilicals per unit (stretch cleanly when drawers extend)
  chassis.forEach((c, idx) => {
    const isShallow = c.depth < 260;
    const xExit = WIDTH / 2 - (isShallow ? 32 : 26);
    const yExit = c.baseY - c.h * 0.18;
    const anchorZ = isShallow ? 14 : trunkZ + 2;
    const anchorX = trunkX - 1;
    const anchorY = c.baseY - 4;
    const baseSag = 38 + ((idx * 17) % 24);
    const baseBow = 10 + (idx % 3) * 7;

    const p0 = new Vec3();
    const p1 = new Vec3();
    const p2 = new Vec3();
    const p3 = new Vec3(anchorX, anchorY, anchorZ);
    const pEnd = new Vec3(anchorX, anchorY, trunkZ);

    const buildCtrl = (slide: number, tilt: number, sagScale = 1, offY = 0, offX = 0) => {
      const zCur = c.baseZ + slide * EJECT;
      const rearZ = zCur - c.depth / 2;
      const sag = (1 - slide * 0.68) * baseSag * sagScale;
      const bow = (1 - slide * 0.45) * baseBow;
      const tiltDrop = tilt * 4;
      p0.set(xExit + offX, yExit + offY - tiltDrop, rearZ);
      p1.set(anchorX + bow * 0.55, yExit + offY - sag * 0.65, rearZ - (isShallow ? 52 * (1 - slide * 0.7) : 34 * (1 - slide * 0.8)));
      p2.set(anchorX + bow, anchorY + offY - sag, (rearZ + anchorZ) * 0.5 - (isShallow ? 26 * (1 - slide * 0.65) : 14));
      return isShallow ? [p0, p1, p2, p3, pEnd] : [p0, p1, p2, p3];
    };

    const pwrCable = makeCable(buildCtrl(0, 0), 3.3, [0.085, 0.095, 0.115], { segments: 18, radial: 6 });

    // Secondary muted ember/ochre data drop on storage/DSP/media/gateway bays
    const hasAux = idx === 1 || idx === 2 || idx === 3 || idx === 4 || idx === 5;
    const auxColor: [number, number, number] = idx % 2 === 1 ? [0.68, 0.34, 0.21] : [0.66, 0.52, 0.26];
    const auxCable = hasAux
      ? makeCable(buildCtrl(0, 0, 1.18, 9, -14), 2.1, auxColor, { segments: 18, radial: 6 })
      : null;

    // On GATEWAY (1U network bay), add messy-clean RJ45 front patch jumpers + sweeping SFP+ uplinks
    let gatewaySync: ((slide: number, tilt: number) => void) | null = null;
    if (c.spec.kind === "network" || c.spec.label === "GATEWAY") {
      const zFace = c.depth / 2 + 1.4;
      const addFrontPatch = (
        xA: number,
        yA: number,
        xB: number,
        yB: number,
        droop: number,
        outZ: number,
        radius: number,
        col: [number, number, number],
      ) => {
        for (const [bx, by] of [
          [xA, yA],
          [xB, yB],
        ]) {
          const boot = makeMesh(4.5, 4.5, 6, [0.09, 0.1, 0.12], null);
          boot.position.set(bx, by, zFace + 2.5);
          c.mesh.addChild(boot);
        }
        const midX = (xA + xB) * 0.5;
        makeCable(
          [
            new Vec3(xA, yA, zFace + 4),
            new Vec3(xA + (xB - xA) * 0.24, yA - droop * 0.72, zFace + outZ * 0.9),
            new Vec3(midX + 3, Math.min(yA, yB) - droop, zFace + outZ),
            new Vec3(xB - (xB - xA) * 0.22, yB - droop * 0.68, zFace + outZ * 0.85),
            new Vec3(xB, yB, zFace + 4),
          ],
          radius,
          col,
          { segments: 16, radial: 6, parent: c.mesh },
        );
      };

      addFrontPatch(-190, 5.5, -131, -5.5, 19, 22, 2.0, [0.1, 0.115, 0.135]);
      addFrontPatch(-161, -5.5, -80, 5.5, 25, 26, 2.0, [0.7, 0.35, 0.21]);
      addFrontPatch(-110, -5.5, -51, 5.5, 16, 18, 1.85, [0.68, 0.54, 0.27]);

      // Dual SFP+ uplinks curving cleanly under the "GATEWAY" label around the right rack ear to side trunk
      const makeUplink = (yPort: number, yUnder: number, xBend: number, r: number, col: [number, number, number]) => {
        const boot = makeMesh(5, 5, 7, [0.12, 0.135, 0.16], null);
        boot.position.set(-10, yPort, zFace + 3);
        c.mesh.addChild(boot);

        const pts = [new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3(trunkX - 4, c.baseY - 12, trunkZ + 12)];
        const buildUplink = (slide: number, tilt: number) => {
          const zCur = c.baseZ + slide * EJECT;
          const rz = zCur + zFace + 5;
          const tiltY = tilt * 2.5;
          pts[0].set(-10, c.baseY + yPort - tiltY, rz);
          pts[1].set(48, c.baseY + yUnder - tiltY * 0.6, rz + 14);
          pts[2].set(xBend, c.baseY + yUnder + 3, rz - 6);
          pts[3].set(trunkX - 2, c.baseY - 14, Math.min(rz - 55, 60));
          return pts;
        };
        const uplink = makeCable(buildUplink(0, 0), r, col, { segments: 20, radial: 6 });
        return (slide: number, tilt: number) => uplink.update(buildUplink(slide, tilt));
      };

      const u1 = makeUplink(5.5, -19, trunkX - 4, 2.05, [0.7, 0.35, 0.21]);
      const u2 = makeUplink(-5.5, -24, trunkX + 2, 2.25, [0.1, 0.115, 0.135]);
      gatewaySync = (slide: number, tilt: number) => {
        u1(slide, tilt);
        u2(slide, tilt);
      };
    }

    c.onEject = (slide: number, tilt: number) => {
      pwrCable.update(buildCtrl(slide, tilt));
      auxCable?.update(buildCtrl(slide, tilt, 1.18, 9, -14));
      gatewaySync?.(slide, tilt);
    };
  });

  // Matte power trunk + coiled excess slack exiting cleanly onto the front-left cold-aisle floor tiles
  makeCable(
    [
      new Vec3(-125, floorY + 14, 70),
      new Vec3(-175, floorY + 5, 148),
      new Vec3(-232, floorY + 5, 198),
      new Vec3(-290, floorY + 5, 224),
      new Vec3(-335, floorY - 5, 212),
    ],
    4.8,
    [0.038, 0.042, 0.05],
    { segments: 22, radial: 6 },
  );
  makeCable(
    [
      new Vec3(-112, floorY + 13, 82),
      new Vec3(-164, floorY + 3.2, 160),
      new Vec3(-224, floorY + 3.2, 212),
      new Vec3(-284, floorY + 3.2, 236),
      new Vec3(-332, floorY - 5, 222),
    ],
    3.1,
    [0.36, 0.16, 0.1],
    { segments: 22, radial: 6 },
  );
  // Casual coiled spare power loop resting on the lit cold-aisle tile beside the front-left foot
  makeCable(
    [
      new Vec3(-148, floorY + 11, 180),
      new Vec3(-172, floorY + 2.8, 216),
      new Vec3(-202, floorY + 2.8, 244),
      new Vec3(-170, floorY + 2.8, 268),
      new Vec3(-140, floorY + 2.8, 246),
      new Vec3(-156, floorY + 2.8, 220),
      new Vec3(-190, floorY + 2.8, 234),
    ],
    2.8,
    [0.048, 0.054, 0.064],
    { segments: 24, radial: 6 },
  );

  const smoothstep01 = (e0: number, e1: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  /** Straight level rail deployment along Z (no forward tilt). */
  const applyUnitEject = (c: (typeof chassis)[number], ej: number) => {
    const clamped = Math.max(0, Math.min(1, ej));
    const slide = smoothstep01(0, 1, clamped);
    c.ej = clamped;
    c.mesh.position.z = c.baseZ + slide * EJECT;
    c.mesh.rotation.x = 0;
    c.onEject?.(slide, 0);
    const col = c.slot.program.uniforms.uColor.value as number[];
    col[0] = 0.16 + clamped * 0.72;
    col[1] = 0.18 + clamped * 0.46;
    col[2] = 0.2 + clamped * 0.08;
  };

  let active = 0;
  let manualPose = false;
  let targetY = presentationMode === "front" ? -14 : chassis[0] ? -chassis[0].baseY : 0;
  let currentY = targetY;
  root.position.y = currentY;
  if (chassis[0] && presentationMode !== "front") applyUnitEject(chassis[0], 1);
  let frameCb: ((f: FrameInfo) => void) | null = null;
  const targetEjects = chassis.map((_, idx) => (idx === 0 ? 1 : 0));

  const setActive = (i: number) => {
    manualPose = false;
    active = Math.max(0, Math.min(chassis.length - 1, i));
    const c = chassis[active];
    targetY = presentationMode === "front" ? -14 : -c.baseY;
    chassis.forEach((_, idx) => {
      targetEjects[idx] = idx === active ? 1 : 0;
    });
  };

  const setPose = (
    fromUnit: number,
    toUnit: number,
    rackT: number,
    ejects: number[],
    activeIdx: number,
  ) => {
    manualPose = true;
    active = Math.max(0, Math.min(chassis.length - 1, activeIdx));
    const a = chassis[Math.max(0, Math.min(chassis.length - 1, fromUnit))];
    const b = chassis[Math.max(0, Math.min(chassis.length - 1, toUnit))];
    targetY = presentationMode === "front" ? -14 : -a.baseY + (-b.baseY - -a.baseY) * rackT;
    currentY = targetY;
    root.position.y = currentY;
    chassis.forEach((ch, idx) => {
      applyUnitEject(ch, ejects[idx] ?? 0);
    });
  };

  /**
   * Solve for the camera distance that makes the rack occupy a fixed multiple
   * of the viewport height. The rack is deliberately larger than the screen so
   * it scrolls past the camera as chapters change.
   * Self-correcting: NDC span is inversely proportional to distance.
   */
  let ndcTop = 1;
  let ndcBottom = -1;
  let rackHeight = 1;

  const ndcYAt = (worldY: number, lo: number, hi: number, h: number) =>
    lo + ((worldY + h / 2) / h) * (hi - lo);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let didInitResize = false;

  const fitCamera = () => {
    const rackH = chassis.reduce((n, ch) => n + ch.h, 0);
    const aspect = Math.max(0.32, camera.aspect || 1);

    let z: number;
    if (presentationMode === "front") {
      // Faceplates + outer posts (~515 units wide). Fit the whole 7-bay rack
      // cleanly on one screen with breathing room for header/hint and bottom dock.
      const frontW = 535;
      const frontFill = aspect < 0.7 ? 0.80 : 0.70;
      const zWidth = frontW / (2 * frontFill * tanHalf * aspect);
      const zHeight = Math.max(760, rackH * 1.36) / (2 * tanHalf);
      z = Math.max(zWidth, zHeight);
    } else {
      const rackW = 730; // accommodates rotated 480-deep rack plus right-side HDD stack on floor

      // The canvas spans the viewport, but the rack lives in the right-hand
      // column. Fit it to that column's width, then centre it there.
      const colFrac = 0.44;
      const fill = 0.9; // fraction of the column the rack should occupy
      z = rackW / (2 * colFrac * fill * tanHalf * aspect);
    }

    camera.position.z = z;
    camera.updateMatrixWorld();
    canvas.dataset.fit = JSON.stringify({
      mode: presentationMode,
      z: Math.round(z),
      tanHalf: +tanHalf.toFixed(3),
      aspect: +aspect.toFixed(3),
    });

    // recentre
    const t2 = new Vec3(0, rackH / 2, 0).applyMatrix4(camera.projectionViewMatrix);
    const b2 = new Vec3(0, -rackH / 2, 0).applyMatrix4(camera.projectionViewMatrix);
    const mid = (t2.y + b2.y) / 2;
    const visH = 2 * tanHalf * camera.position.z;
    root.position.y -= mid * (visH / 2);

    camera.updateMatrixWorld();
    const t3 = new Vec3(0, rackH / 2, 0).applyMatrix4(camera.projectionViewMatrix);
    const b3 = new Vec3(0, -rackH / 2, 0).applyMatrix4(camera.projectionViewMatrix);
    ndcTop = t3.y;
    ndcBottom = b3.y;
    rackHeight = rackH;
  };

  const resize = () => {
    // Measure the host, not the canvas: OGL writes a px size into the canvas
    // style, which would then lock the element at its intrinsic 300x150.
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;

    renderer.setSize(w, h);
    // OGL writes a px size into the element's style; drop it so the CSS box wins.
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
    camera.perspective({ aspect: w / h });

    fitCamera();

    // push the rack slightly toward the right column in split mode while keeping text column clear
    // and center horizontally in front-facing window mode
    const visH = 2 * tanHalf * camera.position.z;
    const visW = visH * (w / h);
    targetRotY = presentationMode === "front" ? FRONT_ROT_Y : SPLIT_ROT_Y;
    targetPosX = presentationMode === "split" ? visW * 0.252 : 0;

    if (!didInitResize || reduce) {
      didInitResize = true;
      currentRotY = targetRotY;
      currentPosX = targetPosX;
      root.rotation.y = currentRotY;
      root.position.x = currentPosX;
    }
  };

  resize();
  const ro = new ResizeObserver(() => resize());
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  window.addEventListener("resize", resize);

  let raf = 0;
  let alive = true;
  let paused = false;
  let frames = 0;
  let fpsClock = performance.now();
  let fps = 0;

  const projectMeshPoint = (mesh: Mesh, lx: number, ly: number, lz: number) => {
    const p = new Vec3(lx, ly, lz);
    p.applyMatrix4(mesh.worldMatrix);
    p.applyMatrix4(camera.projectionViewMatrix);
    return p;
  };

  const frame = () => {
    if (!alive || paused) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);

    currentRotY += (targetRotY - currentRotY) * 0.12;
    currentPosX += (targetPosX - currentPosX) * 0.12;
    root.rotation.y = currentRotY;
    root.position.x = currentPosX;

    if (!manualPose) {
      currentY += (targetY - currentY) * 0.085;
      root.position.y = currentY;

      chassis.forEach((c, i) => {
        applyUnitEject(c, c.ej + (targetEjects[i] - c.ej) * 0.045);
      });
    }

    frames++;
    const nowMs = performance.now();
    if (!reduce && flickerLeds.length > 0) {
      const nowSec = nowMs * 0.001;
      for (const led of flickerLeds) {
        const ej = chassis[led.unitIdx]?.ej ?? 0;
        const isPulled = ej > 0.15;
        const t = nowSec + led.phase;
        // Pulled-out active server enters frequent high-chatter bursts; docked bays stay mostly calm
        const rateMul = isPulled ? 1 + ej * 1.45 : 0.75;
        const thresh = isPulled ? 0.26 - ej * 0.62 : 0.36;
        const burst = Math.sin(t * 1.15 * rateMul) * Math.sin(t * 0.47 * rateMul + 1.3) > thresh;
        const level = burst
          ? 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t * led.rate * (5.0 + ej * 3.8) + Math.sin(t * 11.3)))
          : isPulled
            ? 0.34
            : 0.18;
        const col = led.mesh.program.uniforms.uColor.value as number[];
        col[0] = 0.14 + level * 0.26;
        col[1] = 0.36 + level * 0.58;
        col[2] = 0.2 + level * 0.3;
      }
    }

    if (!reduce && dacDisplays.length > 0 && nowMs - lastDacDrawMs >= 33) {
      lastDacDrawMs = nowMs;
      const tSec = nowMs * 0.001;
      for (const disp of dacDisplays) {
        disp.draw(tSec, chassis[disp.unitIdx]?.ej ?? 0);
      }
    }

    // Subtle blue UID beacon in the top-right corner stays lit while a bay is pulled out or hovered
    for (let i = 0; i < chassis.length; i++) {
      const ch = chassis[i];
      const target = i === hoverUnitIdx || ch.ej > 0.06 ? 1 : 0;
      ch.uidLevel += (target - ch.uidLevel) * (reduce ? 1 : 0.22);
      const uCol = ch.uidLed.program.uniforms.uColor.value as number[];
      uCol[0] = 0.1 + ch.uidLevel * 0.14;
      uCol[1] = 0.13 + ch.uidLevel * 0.53;
      uCol[2] = 0.18 + ch.uidLevel * 0.82;
    }

    // Rigid-body fall/settle physics + independent lift-back return on the top EVE drive
    const dt = Math.min(0.05, Math.max(0, (nowMs - lastHddMs) * 0.001));
    lastHddMs = nowMs;
    stepHddPhysics(dt, hddHoverTarget > 0);

    const eveIdle = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(nowMs * 0.003);
    const eveGlow = hddSim.mode === "fallen" || hddSim.mode === "falling" ? 1 : hddHoverTarget * 0.65;
    for (const led of [eveLed, eveFrontLed]) {
      const col = led.program.uniforms.uColor.value as number[];
      col[0] = 0.84 + eveGlow * 0.16;
      col[1] = 0.6 + eveIdle * 0.16 + eveGlow * 0.24;
      col[2] = 0.24 + eveGlow * 0.28;
    }
    if (nowMs - fpsClock > 500) {
      fps = Math.round((frames * 1000) / (nowMs - fpsClock));
      frames = 0;
      fpsClock = nowMs;
      onStats?.({ fps, tris: totalTris });
    }

    root.updateMatrixWorld();
    camera.updateMatrixWorld();

    if (frameCb) {
      const c = chassis[active];
      const box = canvas.getBoundingClientRect();
      const port = projectMeshPoint(c.mesh, -WIDTH / 2 - 2, 0, c.depth / 2);
      const vt = projectMeshPoint(c.mesh, -WIDTH / 2, c.h / 2, c.depth / 2);
      const vb = projectMeshPoint(c.mesh, -WIDTH / 2, -c.h / 2, c.depth / 2);

      const portX = box.left + (port.x * 0.5 + 0.5) * box.width;
      const portY = box.top + (1 - port.y) * 0.5 * box.height;
      const screenY = box.top + (1 - vt.y) * 0.5 * box.height;
      const faceH = Math.abs(vt.y - vb.y) * 0.5 * box.height;

      frameCb({
        faceH,
        eject: Math.max(0, Math.min(1, (c.mesh.position.z - c.baseZ) / EJECT)),
        x: window.innerWidth * 0.5,
        y: screenY,
        portX,
        portY,
        reach: Math.max(0, c.mesh.position.z - c.baseZ),
      });
    }

    renderer.render({ scene: root, camera });
    emitFirstFrame();
  };

  if (reduce) {
    currentY = targetY;
    root.position.y = currentY;
    renderer.render({ scene: root, camera });
    emitFirstFrame();
  } else {
    raf = requestAnimationFrame(frame);
  }

  const hitUnit = (clientX: number, clientY: number) => {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return -1;
    root.updateMatrixWorld();
    camera.updateMatrixWorld();
    let bestIdx = -1;
    let bestZ = -Infinity;
    const rects: { idx: number; left: number; right: number; top: number; bottom: number }[] = [];
    chassis.forEach((c, idx) => {
      const tl = projectMeshPoint(c.mesh, -WIDTH / 2, c.h / 2, c.depth / 2);
      const br = projectMeshPoint(c.mesh, WIDTH / 2, -c.h / 2, c.depth / 2);
      const left = Math.min(box.left + (tl.x * 0.5 + 0.5) * box.width, box.left + (br.x * 0.5 + 0.5) * box.width);
      const right = Math.max(box.left + (tl.x * 0.5 + 0.5) * box.width, box.left + (br.x * 0.5 + 0.5) * box.width);
      const top = Math.min(box.top + (1 - tl.y) * 0.5 * box.height, box.top + (1 - br.y) * 0.5 * box.height);
      const bottom = Math.max(box.top + (1 - tl.y) * 0.5 * box.height, box.top + (1 - br.y) * 0.5 * box.height);
      rects.push({ idx, left, right, top, bottom });
      if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
        if (c.mesh.position.z >= bestZ) {
          bestZ = c.mesh.position.z;
          bestIdx = idx;
        }
      }
    });
    if (bestIdx >= 0) return bestIdx;

    if (presentationMode === "front") {
      let nearestIdx = -1;
      let nearestDist = Infinity;
      for (const r of rects) {
        if (clientX < r.left - 20 || clientX > r.right + 20) continue;
        const cy = (r.top + r.bottom) * 0.5;
        const halfH = Math.max((r.bottom - r.top) * 0.5 + 4, 24);
        const d = Math.abs(clientY - cy);
        if (d <= halfH && d < nearestDist) {
          nearestDist = d;
          nearestIdx = r.idx;
        }
      }
      return nearestIdx;
    }
    return bestIdx;
  };

  const hitHdd = (clientX: number, clientY: number) => {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return false;
    root.updateMatrixWorld();
    camera.updateMatrixWorld();

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let visibleCorners = 0;

    for (const lx of [-68, 72]) {
      for (const ly of [0, 128]) {
        for (const lz of [-74, 122]) {
          const p = new Vec3(lx, ly, lz);
          p.applyMatrix4(hddGroup.worldMatrix);
          p.applyMatrix4(camera.projectionViewMatrix);
          if (p.z < -1 || p.z > 1) continue;
          visibleCorners++;
          const sx = box.left + (p.x * 0.5 + 0.5) * box.width;
          const sy = box.top + (1 - p.y) * 0.5 * box.height;
          if (sx < minX) minX = sx;
          if (sx > maxX) maxX = sx;
          if (sy < minY) minY = sy;
          if (sy > maxY) maxY = sy;
        }
      }
    }

    if (visibleCorners === 0) return false;
    return clientX >= minX - 6 && clientX <= maxX + 6 && clientY >= minY - 6 && clientY <= maxY + 6;
  };

  let hoverUnitIdx = -1;
  const setHoverUnit = (i: number) => {
    hoverUnitIdx = i;
  };

  const setPresentationMode = (mode: PresentationMode) => {
    if (presentationMode === mode) return;
    presentationMode = mode;
    resize();
    if (reduce) {
      root.updateMatrixWorld();
      renderer.render({ scene: root, camera });
    }
  };

  const setPaused = (next: boolean) => {
    if (paused === next) return;
    paused = next;
    if (paused) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    } else if (alive && !reduce) {
      lastHddMs = performance.now();
      fpsClock = lastHddMs;
      frames = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    }
  };

  return {
    setActive,
    setPose,
    setPresentationMode,
    setPaused,
    hitUnit,
    setHoverUnit,
    hitHdd,
    setHddHover,
    setFrameCallback(cb) {
      frameCb = cb;
    },
    setGrid(on: boolean) {
      for (const p of programs) p.uniforms.uGrid.value = on ? 1 : 0;
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
    },
  };
}