import { Camera, Geometry, Mesh, Program, Renderer, Texture, Transform, Vec3 } from "ogl";
import { getScenePalette, hexToRgbCss, hexToRgba, type ScenePalette } from "../lib/theme";

export type LanyardOptions = {
  name: string;
  handle: string;
  role: string;
  avatar: string;
  location: string;
  size?: number;
  cornerRadius?: number;
  strapLength?: number;
  elasticity?: number;
  damping?: number;
  breeze?: number;
  plainStrap?: boolean;
  finish?: "holographic" | "matte";
  imageFit?: "contain" | "cover";
  onReady?: () => void;
};

export type LanyardHandle = {
  destroy: () => void;
};

const cardVertex = /* glsl */ `
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
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const makeCardFragment = (holo: boolean) => /* glsl */ `
  precision highp float;

  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform vec3 uAmbient;
  uniform vec3 uFillDir;
  uniform vec3 uFillColor;
  uniform float uRim;
  uniform vec3 uPaperCol;
  uniform vec3 uAmberCol;
  uniform vec3 uEmberCol;
  uniform vec3 uIceCol;
  uniform sampler2D uMap;

  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vView;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    vec3 base = texture2D(uMap, vUv).rgb;

    float ndl = clamp((dot(n, uLightDir) + 0.32) / 1.32, 0.0, 1.0);
    float fill = clamp((dot(n, uFillDir) + 0.32) / 1.32, 0.0, 1.0);
    vec3 lit = base * (uAmbient + uLightColor * ndl * 0.72 + uFillColor * fill * 0.38);

    // Feathered satin finish matching ProfileCard softness
    vec3 h = normalize(uLightDir + v);
    float satin = pow(max(dot(n, h), 0.0), 14.0) * 0.11;
    lit += uPaperCol * satin * (0.35 + 0.65 * ndl);

    float ndv = max(dot(n, v), 0.0);
    float fres = pow(1.0 - ndv, 2.35);
    lit += uAmberCol * fres * (uRim * 0.28);

    ${
      holo
        ? `
    float cardU = fract(vUv.x * 2.0);
    float tilt = clamp(length(n.xy) * 2.0, 0.0, 1.0);
    float shift = n.x * 1.4 - n.y * 1.1 + (1.0 - ndv) * 0.7;

    // ProfileCard-matched smooth 118deg satin foil + feathered radial glare
    float diag = fract((cardU * 0.47 - vUv.y * 0.88) * 1.15 + shift * 0.35);
    float wave = 0.5 - 0.5 * cos(diag * 6.28318);
    vec3 foilCol = mix(mix(uAmberCol, uEmberCol, wave), mix(uPaperCol, uIceCol, wave), smoothstep(0.18, 0.88, diag));

    float luma = dot(base, vec3(0.299, 0.587, 0.114));
    float darkProtect = mix(1.0, 0.14, smoothstep(0.08, 0.42, luma));

    vec2 glareCtr = vec2(0.5 + clamp(n.x * 0.9, -0.4, 0.4), 0.56 - clamp(n.y * 0.9, -0.4, 0.4));
    float gDist = length(vec2(cardU, vUv.y) - glareCtr);
    float glareSpot = pow(max(0.0, 1.0 - gDist * 1.08), 1.8) * (0.02 + tilt * 0.12);
    vec3 glareTint = mix(uAmberCol * 0.35, uPaperCol, max(0.0, 1.0 - gDist * 1.65));

    float foilStrength = (0.012 + tilt * 0.1 + fres * 0.06) * darkProtect;
    lit += foilCol * foilStrength + glareTint * glareSpot * (0.4 + 0.6 * darkProtect);
    `
        : ""
    }

    gl_FragColor = vec4(lit, 1.0);
  }
`;

const metalVertex = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec4 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  uniform vec3 cameraPosition;

  varying vec3 vNormal;
  varying vec3 vView;
  varying vec4 vColor;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(cameraPosition - world.xyz);
    vColor = color;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const metalFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform vec3 uAmbient;
  uniform vec3 uFillDir;
  uniform vec3 uFillColor;
  uniform vec3 uMetalRim;

  varying vec3 vNormal;
  varying vec3 vView;
  varying vec4 vColor;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    vec3 base = vColor.rgb;

    float ndl = clamp((dot(n, uLightDir) + 0.32) / 1.32, 0.0, 1.0);
    float fill = clamp((dot(n, uFillDir) + 0.32) / 1.32, 0.0, 1.0);
    vec3 lit = base * (uAmbient + uLightColor * ndl + uFillColor * fill * 0.48);

    vec3 h = normalize(uLightDir + v);
    float spec = pow(max(dot(n, h), 0.0), 18.0) * 0.24;
    lit += uLightColor * spec * (0.3 + 0.7 * ndl);

    float ndv = max(dot(n, v), 0.0);
    float fres = pow(1.0 - ndv, 2.35);
    lit += uMetalRim * fres * vColor.a * 0.78;

    gl_FragColor = vec4(lit, 1.0);
  }
`;

const strapVertex = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;

  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
  }
`;

const makeStrapFragment = (weave: boolean) => /* glsl */ `
  precision mediump float;

  uniform vec3 uLightDir;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;
    float ndl = max(dot(n, uLightDir), 0.0);
    vec3 base = vec3(0.11, 0.12, 0.14);
    ${
      weave
        ? `
    float rib = sin(vUv.x * 110.0) * 0.025 + sin(vUv.y * 260.0 + vUv.x * 28.0) * 0.02;
    float stitch = (vUv.x < 0.09 || vUv.x > 0.91) ? sin(vUv.y * 140.0) * 0.035 : 0.0;
    base += vec3(rib + stitch);
    `
        : ""
    }
    vec3 lit = base * (vec3(0.22, 0.24, 0.28) + vec3(0.85, 0.88, 0.94) * ndl);
    gl_FragColor = vec4(lit, 1.0);
  }
`;

const CARD_MONO = '"Maple Mono", ui-monospace, monospace';
const CARD_SERIF = '"Instrument Serif", Georgia, serif';

// Supersampled packed texture atlas: front half [0..696), 16px gutter, back half [712..1408)
const HALF_W = 696;
const BACK_X = 712;
const ATLAS_W = 1408;
const ATLAS_H = 1014;
const LOGICAL_FRONT_W = 640;
const LOGICAL_FRONT_H = 928;
const LOGICAL_BACK_W = 560;
const LOGICAL_BACK_H = 812;

function angleDiff(target: number, current: number): number {
  let d = (target - current) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function drawRoundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function drawGlowDot(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, rgb: string) {
  const g = ctx.createRadialGradient(cx, cy, size * 0.35, cx, cy, size * 1.45);
  g.addColorStop(0, `rgba(${rgb}, 0.55)`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - size * 1.5, cy - size * 1.5, size * 3, size * 3);
  ctx.fillStyle = color;
  ctx.fillRect(cx - size * 0.5, cy - size * 0.5, size, size);
}

let cachedDotPattern: CanvasPattern | null = null;
let cachedDotColor = "";
function getDotPattern(ctx: CanvasRenderingContext2D, paperHex: string): CanvasPattern | null {
  if (cachedDotPattern && cachedDotColor === paperHex) return cachedDotPattern;
  const tile = document.createElement("canvas");
  tile.width = 24;
  tile.height = 24;
  const tctx = tile.getContext("2d");
  if (!tctx) return null;
  tctx.fillStyle = hexToRgba(paperHex, 0.045);
  tctx.fillRect(4, 4, 1.5, 1.5);
  cachedDotColor = paperHex;
  cachedDotPattern = ctx.createPattern(tile, "repeat");
  return cachedDotPattern;
}

function drawFrontHalf(
  ctx: CanvasRenderingContext2D,
  opts: LanyardOptions,
  portraitImg: HTMLImageElement | null,
  palette: ScenePalette,
) {
  const { tokens } = palette;
  const W = LOGICAL_FRONT_W;
  const H = LOGICAL_FRONT_H;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, HALF_W, ATLAS_H);
  ctx.clip();
  ctx.scale(HALF_W / W, ATLAS_H / H);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, tokens.face);
  bg.addColorStop(0.55, tokens.panel);
  bg.addColorStop(1, tokens.slot);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Portrait fills upper ~76% of the pass with clean crop & dark radial blend
  const py = 0;
  const ph = 708;
  const pBg = ctx.createRadialGradient(W * 0.5, ph * 0.44, 30, W * 0.5, ph * 0.48, W * 0.72);
  pBg.addColorStop(0, tokens.faceHi);
  pBg.addColorStop(0.75, tokens.panel);
  pBg.addColorStop(1, tokens.slot);
  ctx.fillStyle = pBg;
  ctx.fillRect(0, py, W, ph);

  if (portraitImg && portraitImg.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, py, W, ph);
    ctx.clip();

    ctx.filter = "contrast(1.08) saturate(1.06) brightness(0.98)";
    const iw = portraitImg.naturalWidth;
    const ih = portraitImg.naturalHeight;
    const zoom = opts.imageFit === "contain" ? 1.62 : 1.78;
    const s = Math.max(W / iw, ph / ih) * zoom;
    const dw = iw * s;
    const dh = ih * s;
    const dx = (W - dw) * 0.49;
    const dy = (ph - dh) * 0.44;
    ctx.drawImage(portraitImg, dx, dy, dw, dh);
    ctx.filter = "none";

    const vig = ctx.createRadialGradient(W * 0.5, ph * 0.46, W * 0.18, W * 0.5, ph * 0.46, W * 0.62);
    vig.addColorStop(0, hexToRgba(tokens.slot, 0));
    vig.addColorStop(0.65, hexToRgba(tokens.slot, 0.34));
    vig.addColorStop(1, hexToRgba(tokens.slot, 0.92));
    ctx.fillStyle = vig;
    ctx.fillRect(0, py, W, ph);

    const vertScrim = ctx.createLinearGradient(0, 0, 0, ph);
    vertScrim.addColorStop(0, hexToRgba(tokens.slot, 0.58));
    vertScrim.addColorStop(0.24, hexToRgba(tokens.slot, 0));
    vertScrim.addColorStop(0.68, hexToRgba(tokens.slot, 0));
    vertScrim.addColorStop(1, tokens.slot);
    ctx.fillStyle = vertScrim;
    ctx.fillRect(0, py, W, ph);
    ctx.restore();
  }

  // Lower nameplate bar + tiled dot matrix (zero per-dot draw loop)
  ctx.fillStyle = tokens.rack;
  ctx.fillRect(0, ph, W, H - ph);
  const pat = getDotPattern(ctx, tokens.paper);
  if (pat) {
    ctx.fillStyle = pat;
    ctx.fillRect(24, ph + 8, W - 48, H - ph - 32);
  }

  ctx.strokeStyle = hexToRgba(tokens.paper, 0.14);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, ph);
  ctx.lineTo(W, ph);
  ctx.stroke();

  // Top lanyard punch slot cutout
  ctx.fillStyle = "#05070a";
  drawRoundedRectPath(ctx, W / 2 - 52, 34, 104, 18, 9);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(tokens.paper, 0.24);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top header strip
  ctx.font = `500 21px ${CARD_MONO}`;
  ctx.fillStyle = hexToRgba(tokens.paper, 0.68);
  ctx.textAlign = "left";
  ctx.fillText("ID // 01", 42, 92);
  drawGlowDot(ctx, W - 47, 83, 10, tokens.amber, hexToRgbCss(tokens.amber));

  // Nameplate typography
  ctx.textAlign = "left";
  ctx.fillStyle = tokens.paper;
  ctx.font = `400 72px ${CARD_SERIF}`;
  ctx.fillText(opts.name, 42, ph + 88);

  ctx.fillStyle = tokens.ember;
  ctx.font = `500 24px ${CARD_MONO}`;
  ctx.fillText(opts.handle.toUpperCase(), 44, ph + 132);

  ctx.textAlign = "right";
  ctx.fillStyle = tokens.paperDim;
  ctx.font = `500 20px ${CARD_MONO}`;
  ctx.fillText("ONLINE", W - 44, ph + 131);
  drawGlowDot(ctx, W - 141, ph + 123, 10, tokens.led, hexToRgbCss(tokens.led));

  // Outer pass hairline border matching 3D cornerRadius
  const cornerPx = Math.round(Math.min(W, H) * 0.5 * (opts.cornerRadius ?? 0.35));
  ctx.strokeStyle = hexToRgba(tokens.paper, 0.16);
  ctx.lineWidth = 3;
  drawRoundedRectPath(ctx, 10, 10, W - 20, H - 20, Math.max(20, cornerPx - 10));
  ctx.stroke();

  ctx.restore();
}

function drawBackHalf(ctx: CanvasRenderingContext2D, opts: LanyardOptions, palette: ScenePalette) {
  const { tokens, lanyard } = palette;
  const W = LOGICAL_BACK_W;
  const H = LOGICAL_BACK_H;

  ctx.save();
  ctx.beginPath();
  ctx.rect(BACK_X, 0, HALF_W, ATLAS_H);
  ctx.clip();
  ctx.translate(BACK_X, 0);
  ctx.scale(HALF_W / W, ATLAS_H / H);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, tokens.rackHi);
  bg.addColorStop(0.55, tokens.rack);
  bg.addColorStop(1, tokens.slot);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Faint background dot matrix
  const pat = getDotPattern(ctx, tokens.paper);
  if (pat) {
    ctx.fillStyle = pat;
    ctx.fillRect(16, 16, W - 32, H - 32);
  }

  // Punch slot cutout
  ctx.fillStyle = "#05070a";
  drawRoundedRectPath(ctx, W / 2 - 44, 34, 88, 16, 8);
  ctx.fill();
  ctx.strokeStyle = hexToRgba(tokens.paper, 0.2);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Magnetic stripe + indigo conductive trace
  ctx.fillStyle = "#05060a";
  ctx.fillRect(18, 86, W - 36, 56);
  const stripeGrad = ctx.createLinearGradient(18, 86, W - 18, 142);
  stripeGrad.addColorStop(0, lanyard.stripeStops[0]);
  stripeGrad.addColorStop(0.5, lanyard.stripeStops[1]);
  stripeGrad.addColorStop(1, lanyard.stripeStops[2]);
  ctx.fillStyle = stripeGrad;
  ctx.fillRect(18, 86, W - 36, 56);
  ctx.fillStyle = lanyard.stripeTraceCss;
  ctx.fillRect(18, 141, W - 36, 2);

  // Header & tagline
  ctx.textAlign = "left";
  ctx.fillStyle = tokens.ember;
  ctx.font = `500 14px ${CARD_MONO}`;
  ctx.fillText("SPEC // HARDWARE PASS", 42, 192);

  ctx.fillStyle = tokens.paper;
  ctx.font = `italic 400 32px ${CARD_SERIF}`;
  ctx.fillText("Engineering imagination,", 42, 236);
  ctx.fillText("one pixel at a time.", 42, 272);

  // Brushed titanium EMV smartchip graphic (top right)
  const cx = W - 114;
  const cy = 180;
  const cw = 72;
  const ch = 54;
  const chipGrad = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
  chipGrad.addColorStop(0, lanyard.chipStops[0]);
  chipGrad.addColorStop(0.5, lanyard.chipStops[1]);
  chipGrad.addColorStop(1, lanyard.chipStops[2]);
  ctx.fillStyle = chipGrad;
  drawRoundedRectPath(ctx, cx, cy, cw, ch, 8);
  ctx.fill();
  ctx.strokeStyle = tokens.rack;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + 22, cy);
  ctx.lineTo(cx + 22, cy + ch);
  ctx.moveTo(cx + cw - 22, cy);
  ctx.lineTo(cx + cw - 22, cy + ch);
  ctx.moveTo(cx, cy + ch * 0.5);
  ctx.lineTo(cx + 22, cy + ch * 0.5);
  ctx.moveTo(cx + cw - 22, cy + ch * 0.5);
  ctx.lineTo(cx + cw, cy + ch * 0.5);
  ctx.stroke();
  drawRoundedRectPath(ctx, cx + 22, cy + 12, cw - 44, ch - 24, 3);
  ctx.stroke();

  // Divider below header
  ctx.strokeStyle = hexToRgba(tokens.paper, 0.12);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(42, 304);
  ctx.lineTo(W - 42, 304);
  ctx.stroke();

  // Non-duplicate high-signal pass identity details
  const rows: [string, string][] = [
    ["TIMEZONE", "IST · UTC+05:30"],
    ["WRITING CODE", "SINCE 2014"],
    ["GITHUB", "@NAMANYT"],
    ["CONTACT", "ME@CIDERBOI.XYZ"],
  ];

  let ry = 362;
  for (const [k, v] of rows) {
    ctx.strokeStyle = hexToRgba(tokens.paper, 0.08);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(42, ry + 22);
    ctx.lineTo(W - 42, ry + 22);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = tokens.dim;
    ctx.font = `500 14.5px ${CARD_MONO}`;
    ctx.fillText(k, 42, ry);

    ctx.textAlign = "right";
    ctx.fillStyle = tokens.paper;
    ctx.font = `500 15.5px ${CARD_MONO}`;
    ctx.fillText(v, W - 42, ry);
    ry += 62;
  }

  // Code 128B ("ciderboi.xyz", 167 modules) + 25x25 ECC-M QR ("mailto:me@ciderboi.xyz")
  const bxBoxX = 42;
  const bxBoxY = 618;
  const bxBoxW = 352;
  const bxBoxH = 72;
  ctx.fillStyle = tokens.slot;
  ctx.fillRect(bxBoxX, bxBoxY, bxBoxW, bxBoxH);
  ctx.strokeStyle = hexToRgba(tokens.paper, 0.08);
  ctx.lineWidth = 1;
  ctx.strokeRect(bxBoxX, bxBoxY, bxBoxW, bxBoxH);

  const code128Widths =
    "2112141411221421121412211122141212411214211341111421121222314212112121412141211321132331112";
  const barUnit = 1.98;
  let bx = bxBoxX + (bxBoxW - 167 * barUnit) * 0.5;
  ctx.fillStyle = hexToRgba(tokens.paper, 0.86);
  for (let i = 0; i < code128Widths.length; i++) {
    const bw = Number(code128Widths[i]) * barUnit;
    if (i % 2 === 0) ctx.fillRect(bx, bxBoxY + 9, bw, bxBoxH - 18);
    bx += bw;
  }

  // QR v2-M ("mailto:me@ciderboi.xyz") inside clean quiet-zone box aligned to right margin
  const qrSize = 25;
  const cell = 3.2;
  const qrBoxSize = 104;
  const qrBoxX = W - 42 - qrBoxSize;
  const qrBoxY = 602;
  ctx.fillStyle = tokens.slot;
  ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
  ctx.strokeStyle = hexToRgba(tokens.paper, 0.08);
  ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

  const qrRows = [
    0x1fd197f, 0x1051541, 0x1748e5d, 0x175f85d, 0x1744f5d,
    0x104d541, 0x1fd557f, 0x0014600, 0x16e254b, 0x078fd6c,
    0x11da4b8, 0x17bab0e, 0x0e5efdd, 0x0292bff, 0x0959806,
    0x17897b3, 0x01fa9fd, 0x001151d, 0x1fdf95b, 0x105571b,
    0x174b9f2, 0x1759ad7, 0x1753afe, 0x104c074, 0x1fd14d7,
  ];
  const qrStartX = qrBoxX + (qrBoxSize - qrSize * cell) * 0.5;
  const qrStartY = qrBoxY + (qrBoxSize - qrSize * cell) * 0.5;
  ctx.fillStyle = hexToRgba(tokens.paper, 0.88);
  for (let r = 0; r < qrSize; r++) {
    const rowMask = qrRows[r];
    for (let c = 0; c < qrSize; c++) {
      if ((rowMask >> (qrSize - 1 - c)) & 1) {
        ctx.fillRect(qrStartX + c * cell, qrStartY + r * cell, cell + 0.08, cell + 0.08);
      }
    }
  }

  // Serial + interactive hint
  ctx.textAlign = "left";
  ctx.fillStyle = tokens.dim;
  ctx.font = `500 13px ${CARD_MONO}`;
  ctx.fillText("SN // NN-11-03-07", 42, H - 52);

  ctx.textAlign = "right";
  ctx.fillStyle = hexToRgba(tokens.ember, 0.9);
  ctx.font = `500 13px ${CARD_MONO}`;
  ctx.fillText("CLICK TO FLIP · DRAG TO SWING", W - 42, H - 52);

  // Outer pass hairline border matching 3D cornerRadius
  const cornerPx = Math.round(Math.min(W, H) * 0.5 * (opts.cornerRadius ?? 0.35));
  ctx.strokeStyle = hexToRgba(tokens.paper, 0.16);
  ctx.lineWidth = 2.5;
  drawRoundedRectPath(ctx, 9, 9, W - 18, H - 18, Math.max(20, cornerPx - 9));
  ctx.stroke();

  ctx.restore();
}

function buildCardGeometries(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  cardW: number,
  cardH: number,
  cardD: number,
  radiusRatio: number,
  size: number,
  claspPivotY: number,
) {
  const hw = cardW * 0.5;
  const hh = cardH * 0.5;
  const hz = cardD * 0.5;
  const r = Math.min(hw, hh) * Math.max(0.02, Math.min(0.48, radiusRatio));
  const arcSegs = 5;

  const corners: [number, number, number][] = [
    [hw - r, hh - r, 0],
    [-hw + r, hh - r, Math.PI * 0.5],
    [-hw + r, -hh + r, Math.PI],
    [hw - r, -hh + r, Math.PI * 1.5],
  ];

  const ring: [number, number][] = [];
  for (const [cx, cy, a0] of corners) {
    for (let s = 0; s <= arcSegs; s++) {
      const a = a0 + (s / arcSegs) * (Math.PI * 0.5);
      ring.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  const nPts = ring.length;

  // 1. Merged front + back card faces geometry mapped into the single 1024x737 atlas
  const faceStrideV = nPts + 1;
  const fPos = new Float32Array(faceStrideV * 2 * 3);
  const fNorm = new Float32Array(faceStrideV * 2 * 3);
  const fUv = new Float32Array(faceStrideV * 2 * 2);
  const fIdx = new Uint16Array(nPts * 2 * 3);

  const uFrontSpan = HALF_W / ATLAS_W;
  const uBackOff = BACK_X / ATLAS_W;
  const uBackSpan = HALF_W / ATLAS_W;

  const fillFace = (zSign: 1 | -1, vBase: number, iBase: number) => {
    fPos[vBase * 3 + 2] = zSign * hz;
    fNorm[vBase * 3 + 2] = zSign;
    fUv[vBase * 2] = zSign > 0 ? uFrontSpan * 0.5 : uBackOff + uBackSpan * 0.5;
    fUv[vBase * 2 + 1] = 0.5;

    for (let i = 0; i < nPts; i++) {
      const [px, py] = ring[i];
      const v = vBase + i + 1;
      fPos[v * 3] = px;
      fPos[v * 3 + 1] = py;
      fPos[v * 3 + 2] = zSign * hz;
      fNorm[v * 3 + 2] = zSign;

      const uNorm = px / cardW + 0.5;
      fUv[v * 2] = zSign > 0 ? uFrontSpan * uNorm : uBackOff + uBackSpan * (1 - uNorm);
      fUv[v * 2 + 1] = py / cardH + 0.5;

      const next = vBase + (i + 1 < nPts ? i + 2 : 1);
      const tri = iBase + i * 3;
      if (zSign > 0) {
        fIdx[tri] = vBase;
        fIdx[tri + 1] = vBase + i + 1;
        fIdx[tri + 2] = next;
      } else {
        fIdx[tri] = vBase;
        fIdx[tri + 1] = next;
        fIdx[tri + 2] = vBase + i + 1;
      }
    }
  };

  fillFace(1, 0, 0);
  fillFace(-1, faceStrideV, nPts * 3);

  const facesGeo = new Geometry(gl as any, {
    position: { size: 3, data: fPos },
    normal: { size: 3, data: fNorm },
    uv: { size: 2, data: fUv },
    index: { data: fIdx },
  });

  // 2. Merged rigid hardware geometry: card rim + 3 clasp boxes (1 draw call, per-vertex RGBA = rgb + rim)
  const rimVertCount = (nPts + 1) * 2;
  const rimIdxCount = nPts * 6;
  const boxes: Array<{
    cx: number;
    cy: number;
    cz: number;
    w: number;
    h: number;
    d: number;
    col: [number, number, number, number];
  }> = [
    { cx: 0, cy: cardH * 0.5 + 0.03 * size, cz: 0, w: 0.34 * size, h: 0.18 * size, d: 0.1 * size, col: [0.34, 0.38, 0.44, 0.6] },
    { cx: 0, cy: cardH * 0.5 + 0.14 * size, cz: 0, w: 0.14 * size, h: 0.18 * size, d: 0.07 * size, col: [0.48, 0.52, 0.58, 0.7] },
    { cx: 0, cy: claspPivotY + 0.03 * size, cz: 0, w: 0.32 * size, h: 0.1 * size, d: 0.085 * size, col: [0.1, 0.115, 0.14, 0.35] },
  ];

  const totalVerts = rimVertCount + boxes.length * 24;
  const totalIdx = rimIdxCount + boxes.length * 36;
  const mPos = new Float32Array(totalVerts * 3);
  const mNorm = new Float32Array(totalVerts * 3);
  const mCol = new Float32Array(totalVerts * 4);
  const mIdx = new Uint16Array(totalIdx);

  for (let i = 0; i <= nPts; i++) {
    const [px, py] = ring[i % nPts];
    const [prevX, prevY] = ring[(i - 1 + nPts) % nPts];
    const [nextX, nextY] = ring[(i + 1) % nPts];
    const tx = nextX - prevX;
    const ty = nextY - prevY;
    const len = Math.hypot(tx, ty) || 1;
    const nx = ty / len;
    const ny = -tx / len;

    for (let side = 0; side < 2; side++) {
      const v = i * 2 + side;
      mPos[v * 3] = px;
      mPos[v * 3 + 1] = py;
      mPos[v * 3 + 2] = side === 0 ? -hz : hz;
      mNorm[v * 3] = nx;
      mNorm[v * 3 + 1] = ny;
      mCol[v * 4] = 0.16;
      mCol[v * 4 + 1] = 0.18;
      mCol[v * 4 + 2] = 0.22;
      mCol[v * 4 + 3] = 0.55;
    }
  }
  for (let i = 0; i < nPts; i++) {
    const b0 = i * 2;
    const f0 = b0 + 1;
    const b1 = b0 + 2;
    const f1 = b0 + 3;
    const k = i * 6;
    mIdx[k] = b0;
    mIdx[k + 1] = b1;
    mIdx[k + 2] = f0;
    mIdx[k + 3] = b1;
    mIdx[k + 4] = f1;
    mIdx[k + 5] = f0;
  }

  let vCur = rimVertCount;
  let iCur = rimIdxCount;
  const boxFaces: Array<[number[], [number, number, number]]> = [
    [[-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1], [0, 0, 1]],
    [[1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1], [0, 0, -1]],
    [[1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1], [1, 0, 0]],
    [[-1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1], [-1, 0, 0]],
    [[-1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1], [0, 1, 0]],
    [[-1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1], [0, -1, 0]],
  ];

  for (const box of boxes) {
    const bx = box.w * 0.5;
    const by = box.h * 0.5;
    const bz = box.d * 0.5;
    for (const [cornersArr, n] of boxFaces) {
      const baseV = vCur;
      for (let c = 0; c < 4; c++) {
        mPos[vCur * 3] = box.cx + cornersArr[c * 3] * bx;
        mPos[vCur * 3 + 1] = box.cy + cornersArr[c * 3 + 1] * by;
        mPos[vCur * 3 + 2] = box.cz + cornersArr[c * 3 + 2] * bz;
        mNorm[vCur * 3] = n[0];
        mNorm[vCur * 3 + 1] = n[1];
        mNorm[vCur * 3 + 2] = n[2];
        mCol[vCur * 4] = box.col[0];
        mCol[vCur * 4 + 1] = box.col[1];
        mCol[vCur * 4 + 2] = box.col[2];
        mCol[vCur * 4 + 3] = box.col[3];
        vCur++;
      }
      mIdx[iCur++] = baseV;
      mIdx[iCur++] = baseV + 1;
      mIdx[iCur++] = baseV + 2;
      mIdx[iCur++] = baseV;
      mIdx[iCur++] = baseV + 2;
      mIdx[iCur++] = baseV + 3;
    }
  }

  const hardwareGeo = new Geometry(gl as any, {
    position: { size: 3, data: mPos },
    normal: { size: 3, data: mNorm },
    color: { size: 4, data: mCol },
    index: { data: mIdx },
  });

  return { facesGeo, hardwareGeo };
}

export function mountLanyard(canvas: HTMLCanvasElement, opts: LanyardOptions): LanyardHandle | null {
  const size = opts.size ?? 0.8;
  const cornerRadius = opts.cornerRadius ?? 0.35;
  const elasticity = opts.elasticity ?? 0.15;
  const damping = opts.damping ?? 0.92;
  const breeze = opts.breeze ?? 0.65;
  const strapLength = opts.strapLength ?? 0;
  const useHolo = (opts.finish ?? "holographic") === "holographic";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rawDpr = window.devicePixelRatio || 1;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const getTargetDpr = () => Math.min(window.devicePixelRatio || 1, isCoarse ? 1.5 : 2.0);

  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: rawDpr < 1.5,
      premultipliedAlpha: true,
      powerPreference: "low-power",
      dpr: getTargetDpr(),
    });
  } catch {
    return null;
  }

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 30, near: 0.1, far: 100, aspect: 1 });
  camera.position.set(0, 0, 10.5);
  camera.lookAt(new Vec3(0, 0, 0));
  camera.updateMatrixWorld();

  const probe = new Vec3(0, 1, 0).applyMatrix4(camera.projectionViewMatrix);
  const tanHalf = 1 / Math.max(0.0001, probe.y * camera.position.z);

  const palette = getScenePalette();

  // Shared pre-normalized lighting vectors
  const lightDir = new Vec3(-0.45, 0.72, 0.78).normalize();
  const fillDir = new Vec3(0.6, 0.2, 0.5).normalize();
  const lightUniforms = {
    uLightDir: { value: lightDir },
    uLightColor: { value: palette.lanyard.keyLight },
    uAmbient: { value: palette.lanyard.ambient },
    uFillDir: { value: fillDir },
    uFillColor: { value: palette.lanyard.fillLight },
  };

  // Single 1024x737 packed atlas canvas for both card faces
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = ATLAS_W;
  atlasCanvas.height = ATLAS_H;
  const atlasCtx = atlasCanvas.getContext("2d")!;

  drawFrontHalf(atlasCtx, opts, null, palette);
  drawBackHalf(atlasCtx, opts, palette);

  const useMips = renderer.isWebgl2;
  const atlasTex = new Texture(gl, {
    image: atlasCanvas,
    generateMipmaps: useMips,
    minFilter: useMips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
    magFilter: gl.LINEAR,
    anisotropy: 16,
  });
  if (useMips) {
    atlasTex.onUpdate = () => {
      const gl2 = gl as WebGL2RenderingContext;
      gl2.texParameterf(gl2.TEXTURE_2D, gl2.TEXTURE_MAX_LOD, 1.0);
    };
  }

  const cardProg = new Program(gl, {
    vertex: cardVertex,
    fragment: makeCardFragment(useHolo),
    cullFace: gl.BACK,
    uniforms: {
      ...lightUniforms,
      uRim: { value: 0.38 },
      uPaperCol: { value: palette.lanyard.foilPaper },
      uAmberCol: { value: palette.lanyard.foilHighlight },
      uEmberCol: { value: palette.lanyard.foilAccent },
      uIceCol: { value: palette.lanyard.foilIce },
      uMap: { value: atlasTex },
    },
  });

  const metalProg = new Program(gl, {
    vertex: metalVertex,
    fragment: metalFragment,
    cullFace: gl.BACK,
    uniforms: {
      ...lightUniforms,
      uMetalRim: { value: palette.lanyard.metalRim },
    },
  });

  const strapProg = new Program(gl, {
    vertex: strapVertex,
    fragment: makeStrapFragment(opts.plainStrap !== false),
    cullFace: false,
    uniforms: {
      uLightDir: lightUniforms.uLightDir,
    },
  });

  let alive = true;
  let readySent = false;
  const emitReady = () => {
    if (readySent) return;
    readySent = true;
    opts.onReady?.();
  };
  let raf = 0;
  let isVisible = true;
  let loopReady = false;
  let lastMs = performance.now();
  let lastRenderMs = 0;
  let activeUntilMs = performance.now() + 2400;

  const wakeLoop = () => {
    if (!alive || !loopReady || reduce || document.hidden || !isVisible || raf) return;
    lastMs = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const markActive = (ms = 1600) => {
    const until = performance.now() + ms;
    if (until > activeUntilMs) activeUntilMs = until;
    wakeLoop();
  };

  // Load portrait & fonts cleanly without redundant back-card rebakes
  const portraitImg = new Image();
  portraitImg.decoding = "async";
  const fontsReadyAtBoot =
    typeof document.fonts?.check === "function" &&
    document.fonts.check(`400 72px ${CARD_SERIF}`) &&
    document.fonts.check(`italic 400 32px ${CARD_SERIF}`) &&
    document.fonts.check(`500 24px ${CARD_MONO}`);
  let fontsDone = fontsReadyAtBoot;

  let portraitDone = false;
  const checkReady = () => {
    if (portraitDone && fontsDone) emitReady();
  };

  const uploadFront = () => {
    if (!alive) return;
    portraitDone = true;
    drawFrontHalf(atlasCtx, opts, portraitImg.complete && portraitImg.naturalWidth > 0 ? portraitImg : null, palette);
    atlasTex.needsUpdate = true;
    checkReady();
    if (!loopReady) return;
    if (reduce) renderFrame();
    else markActive(300);
  };

  const uploadBothForFonts = () => {
    if (!alive || fontsDone) return;
    fontsDone = true;
    drawFrontHalf(atlasCtx, opts, portraitImg.complete && portraitImg.naturalWidth > 0 ? portraitImg : null, palette);
    drawBackHalf(atlasCtx, opts, palette);
    atlasTex.needsUpdate = true;
    checkReady();
    if (!loopReady) return;
    if (reduce) renderFrame();
    else markActive(300);
  };

  portraitImg.onload = () => {
    uploadFront();
  };
  portraitImg.onerror = () => {
    if (!portraitImg.src.endsWith("/img/pfp-480.webp")) {
      portraitImg.src = "/img/pfp-480.webp";
    } else {
      portraitDone = true;
      checkReady();
    }
  };
  portraitImg.src = opts.avatar;
  if (!fontsDone && document.fonts) {
    Promise.all([
      document.fonts.load(`400 72px ${CARD_SERIF}`),
      document.fonts.load(`italic 400 32px ${CARD_SERIF}`),
      document.fonts.load(`500 24px ${CARD_MONO}`),
      document.fonts.ready,
    ]).then(uploadBothForFonts);
  }
  const readyGuardTimer = window.setTimeout(emitReady, 450);

  const scene = new Transform();
  const cardW = 2.0 * size;
  const cardH = 2.9 * size;
  const cardD = 0.055 * size;
  const claspPivotY = cardH * 0.5 + 0.17 * size;

  const cardGroup = new Transform();
  scene.addChild(cardGroup);

  const cardBody = new Transform();
  cardBody.position.set(0, -claspPivotY, 0);
  cardGroup.addChild(cardBody);

  const { facesGeo, hardwareGeo } = buildCardGeometries(gl, cardW, cardH, cardD, cornerRadius, size, claspPivotY);

  const cardFacesMesh = new Mesh(gl, { geometry: facesGeo, program: cardProg });
  cardBody.addChild(cardFacesMesh);

  const hardwareMesh = new Mesh(gl, { geometry: hardwareGeo, program: metalProg });
  cardBody.addChild(hardwareMesh);

  // Woven lanyard strap ribbon driven by Verlet chain (analytic Catmull-Rom tangent, DYNAMIC_DRAW)
  const NODES = 6;
  const strapSegs = 8;
  const strapW = 0.28 * size;
  const strapVertCount = (strapSegs + 1) * 2;
  const strapPos = new Float32Array(strapVertCount * 3);
  const strapNorm = new Float32Array(strapVertCount * 3);
  const strapUv = new Float32Array(strapVertCount * 2);
  const strapIdx = new Uint16Array(strapSegs * 6);

  for (let i = 0; i <= strapSegs; i++) {
    const v = i / strapSegs;
    strapUv[i * 4] = 0;
    strapUv[i * 4 + 1] = v;
    strapUv[i * 4 + 2] = 1;
    strapUv[i * 4 + 3] = v;
  }
  for (let i = 0; i < strapSegs; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    strapIdx[i * 6] = a;
    strapIdx[i * 6 + 1] = c;
    strapIdx[i * 6 + 2] = b;
    strapIdx[i * 6 + 3] = c;
    strapIdx[i * 6 + 4] = d;
    strapIdx[i * 6 + 5] = b;
  }

  const strapGeo = new Geometry(gl as any, {
    position: { size: 3, data: strapPos, usage: gl.DYNAMIC_DRAW },
    normal: { size: 3, data: strapNorm, usage: gl.DYNAMIC_DRAW },
    uv: { size: 2, data: strapUv },
    index: { data: strapIdx },
  });
  const strapMesh = new Mesh(gl, { geometry: strapGeo, program: strapProg });
  scene.addChild(strapMesh);

  // Verlet strap chain + rigid-body card pendulum
  let topAnchorY = 2.6;
  let strapDrop = (0.64 + strapLength * 1.4) * size;
  let segLen = strapDrop / (NODES - 1);

  const nodes = Array.from({ length: NODES }, () => new Vec3());
  const prevNodes = Array.from({ length: NODES }, () => new Vec3());
  const claspPos = new Vec3();
  const claspVel = new Vec3();
  const cardState = {
    rx: 0.02,
    ry: 0.04,
    rz: 0,
    ox: 0,
    oy: 0,
    oz: 0,
  };

  const resetChain = () => {
    claspPos.set(0, topAnchorY - strapDrop, 0);
    claspVel.set(0, 0, 0);
    cardState.rx = 0.02;
    cardState.ry = flipped ? Math.PI : 0.04;
    cardState.rz = 0;
    cardState.ox = 0;
    cardState.oy = 0;
    cardState.oz = 0;
    for (let i = 0; i < NODES; i++) {
      nodes[i].set(0, topAnchorY - i * segLen, 0);
      prevNodes[i].copy(nodes[i]);
    }
  };

  let grabbed = false;
  let hover = false;
  let flipped = false;
  let downX = 0;
  let downY = 0;
  let downMs = 0;
  let downButton = 0;
  let maxMoveSq = 0;
  let lastSizeW = 0;
  let lastSizeH = 0;
  let lastDpr = 0;
  let cachedRect: DOMRect | null = null;
  let rectDirty = true;

  // Cached card screen bounds in canvas NDC [-1..1], computed once per render
  let ndcMinX = -0.5;
  let ndcMaxX = 0.5;
  let ndcMinY = -0.8;
  let ndcMaxY = 0.6;
  const hitTmp = new Vec3();

  const grabClaspOffset = new Vec3();
  const grabTarget = new Vec3();
  const prevDragPos = new Vec3();
  const dragVel = new Vec3();

  const hitSurface: HTMLElement = canvas.parentElement ?? canvas;

  const solveCamera = () => {
    const w = canvas.clientWidth || 380;
    const h = canvas.clientHeight || 360;
    if (!w || !h) return;
    rectDirty = true;

    const cRect = getRect();
    const sRect = hitSurface !== canvas ? hitSurface.getBoundingClientRect() : cRect;
    const sw = sRect.width || w;
    const sh = sRect.height || h;
    const nextDpr = getTargetDpr();

    if (w !== lastSizeW || h !== lastSizeH || nextDpr !== lastDpr) {
      lastSizeW = w;
      lastSizeH = h;
      lastDpr = nextDpr;
      renderer.dpr = nextDpr;
      renderer.setSize(w, h);
      canvas.style.removeProperty("width");
      canvas.style.removeProperty("height");
      camera.perspective({ aspect: w / h });
      markActive();
    }

    strapDrop = (0.64 + strapLength * 1.4) * size;
    segLen = strapDrop / (NODES - 1);
    const totalHang = strapDrop + claspPivotY + cardH * 0.51;
    const slotAspect = sw / Math.max(1, sh);
    const minSlotVisHForWidth = (cardW * 1.92) / Math.max(0.55, slotAspect);
    const slotVisH = Math.max(totalHang * 1.07, minSlotVisHForWidth);
    const canvasVisH = slotVisH * (h / Math.max(1, sh));

    camera.position.z = canvasVisH / (2 * tanHalf);
    const worldPerPx = canvasVisH / h;
    camera.position.x = (cRect.left + w * 0.5 - (sRect.left + sw * 0.5)) * worldPerPx;
    camera.position.y = (sRect.top + sh * 0.5 - (cRect.top + h * 0.5)) * worldPerPx;
    camera.updateMatrixWorld();

    topAnchorY = slotVisH * 0.5 + 0.02;
    if (!grabbed) {
      nodes[0].set(0, topAnchorY, 0);
    }
  };

  const getRect = () => {
    if (rectDirty || !cachedRect) {
      cachedRect = canvas.getBoundingClientRect();
      rectDirty = false;
    }
    return cachedRect;
  };

  const invalidateRect = () => {
    rectDirty = true;
  };

  solveCamera();
  resetChain();

  const ro = new ResizeObserver(() => solveCamera());
  ro.observe(canvas);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  window.addEventListener("scroll", invalidateRect, { passive: true });
  window.addEventListener("resize", solveCamera, { passive: true });

  let dprMql: MediaQueryList | null = null;
  const watchDpr = () => {
    dprMql?.removeEventListener("change", onDprChange);
    dprMql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprMql.addEventListener("change", onDprChange, { once: true });
  };
  const onDprChange = () => {
    solveCamera();
    watchDpr();
  };
  watchDpr();

  // Single-pass Catmull-Rom position + exact analytical tangent
  const sampleRopeAndTangent = (u: number, outPos: Vec3, outTan: Vec3) => {
    const f = Math.max(0, Math.min(NODES - 1, u * (NODES - 1)));
    const i0 = Math.min(NODES - 2, Math.floor(f));
    const t = f - i0;
    const p0 = nodes[Math.max(0, i0 - 1)];
    const p1 = nodes[i0];
    const p2 = nodes[i0 + 1];
    const p3 = nodes[Math.min(NODES - 1, i0 + 2)];
    const t2 = t * t;
    const t3 = t2 * t;

    const ax = 2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x;
    const bx = -p0.x + 3 * p1.x - 3 * p2.x + p3.x;
    outPos.x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + ax * t2 + bx * t3);
    outTan.x = 0.5 * (-p0.x + p2.x + 2 * ax * t + 3 * bx * t2);

    const ay = 2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y;
    const by = -p0.y + 3 * p1.y - 3 * p2.y + p3.y;
    outPos.y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + ay * t2 + by * t3);
    outTan.y = 0.5 * (-p0.y + p2.y + 2 * ay * t + 3 * by * t2);

    const az = 2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z;
    const bz = -p0.z + 3 * p1.z - 3 * p2.z + p3.z;
    outPos.z = 0.5 * (2 * p1.z + (-p0.z + p2.z) * t + az * t2 + bz * t3);
    outTan.z = 0.5 * (-p0.z + p2.z + 2 * az * t + 3 * bz * t2);
  };

  const pSample = new Vec3();
  const tangent = new Vec3();
  const side = new Vec3();
  const normVec = new Vec3();
  const viewAxis = new Vec3(0, 0, 1);

  let lastStrapHash = NaN;
  const updateStrapGeometry = (force = false) => {
    let hash = cardState.ry * 13.7;
    for (let i = 0; i < NODES; i++) {
      const n = nodes[i];
      hash += n.x * (i + 1) + n.y * (i + 3) + n.z * (i + 5);
    }
    if (!force && Math.abs(hash - lastStrapHash) < 1e-4) return;
    lastStrapHash = hash;

    const twistEnd = Math.sin(cardState.ry) * 0.55;
    const hw = strapW * 0.5;
    for (let i = 0; i <= strapSegs; i++) {
      const u = i / strapSegs;
      sampleRopeAndTangent(u, pSample, tangent);
      if (tangent.len() < 1e-5) tangent.set(0, -1, 0);
      else tangent.normalize();

      const twist = twistEnd * (u * u);
      viewAxis.set(Math.sin(twist), 0, Math.cos(twist));
      side.cross(tangent, viewAxis);
      if (side.len() < 1e-4) side.set(1, 0, 0);
      else side.normalize();
      normVec.cross(side, tangent);
      if (normVec.len() < 1e-5) normVec.set(0, 0, 1);
      else normVec.normalize();

      const vi = i * 2;
      strapPos[vi * 3] = pSample.x - side.x * hw;
      strapPos[vi * 3 + 1] = pSample.y - side.y * hw;
      strapPos[vi * 3 + 2] = pSample.z - side.z * hw;
      strapNorm[vi * 3] = normVec.x;
      strapNorm[vi * 3 + 1] = normVec.y;
      strapNorm[vi * 3 + 2] = normVec.z;

      strapPos[(vi + 1) * 3] = pSample.x + side.x * hw;
      strapPos[(vi + 1) * 3 + 1] = pSample.y + side.y * hw;
      strapPos[(vi + 1) * 3 + 2] = pSample.z + side.z * hw;
      strapNorm[(vi + 1) * 3] = normVec.x;
      strapNorm[(vi + 1) * 3 + 1] = normVec.y;
      strapNorm[(vi + 1) * 3 + 2] = normVec.z;
    }
    strapGeo.attributes.position.needsUpdate = true;
    strapGeo.attributes.normal.needsUpdate = true;
  };

  const updateHitBounds = () => {
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    const xs = [-cardW * 0.54, cardW * 0.54];
    const ys = [-cardH * 0.52, cardH * 0.58];
    const zs = [-cardD, cardD];
    for (let ix = 0; ix < 2; ix++) {
      for (let iy = 0; iy < 2; iy++) {
        for (let iz = 0; iz < 2; iz++) {
          hitTmp.set(xs[ix], ys[iy], zs[iz]);
          hitTmp.applyMatrix4(cardBody.worldMatrix);
          hitTmp.applyMatrix4(camera.projectionViewMatrix);
          if (hitTmp.x < x0) x0 = hitTmp.x;
          if (hitTmp.x > x1) x1 = hitTmp.x;
          if (hitTmp.y < y0) y0 = hitTmp.y;
          if (hitTmp.y > y1) y1 = hitTmp.y;
        }
      }
    }
    ndcMinX = x0;
    ndcMaxX = x1;
    ndcMinY = y0;
    ndcMaxY = y1;
  };

  const screenToWorldOnPlane = (clientX: number, clientY: number, zPlane: number, out: Vec3) => {
    const rect = getRect();
    const nx = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = (1 - (clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    const dist = camera.position.z - zPlane;
    const halfH = tanHalf * dist;
    const halfW = halfH * (rect.width / Math.max(1, rect.height));
    out.set(camera.position.x + nx * halfW, camera.position.y + ny * halfH, zPlane);
    return out;
  };

  const hitCard = (clientX: number, clientY: number) => {
    const rect = getRect();
    if (!rect.width || !rect.height) return false;
    const padX = (20 / rect.width);
    const padY = (20 / rect.height);
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = (1 - (clientY - rect.top) / rect.height) * 2 - 1;
    return nx >= ndcMinX - padX && nx <= ndcMaxX + padX && ny >= ndcMinY - padY && ny <= ndcMaxY + padY;
  };

  let lastMoveMs = performance.now();

  const onWindowMove = (e: PointerEvent) => {
    if (!grabbed) return;
    const dxMove = e.clientX - downX;
    const dyMove = e.clientY - downY;
    const dSq = dxMove * dxMove + dyMove * dyMove;
    if (dSq > maxMoveSq) maxMoveSq = dSq;

    const now = performance.now();
    const moveDt = Math.max(0.004, Math.min(0.05, (now - lastMoveMs) * 0.001));
    lastMoveMs = now;
    screenToWorldOnPlane(e.clientX, e.clientY, claspPos.z, grabTarget);
    dragVel.sub(grabTarget, prevDragPos).scale(1 / moveDt);
    prevDragPos.copy(grabTarget);
    markActive(2500);
  };

  const releaseGrab = (e: PointerEvent) => {
    if (!grabbed) return;
    grabbed = false;
    hitSurface.style.touchAction = "pan-y";
    hitSurface.style.cursor = hover ? "grab" : "";
    if (hitSurface.hasPointerCapture(e.pointerId)) {
      hitSurface.releasePointerCapture(e.pointerId);
    }
    window.removeEventListener("pointermove", onWindowMove);
    window.removeEventListener("pointerup", releaseGrab);
    window.removeEventListener("pointercancel", releaseGrab);

    const dxEnd = e.clientX - downX;
    const dyEnd = e.clientY - downY;
    const finalSq = Math.max(maxMoveSq, dxEnd * dxEnd + dyEnd * dyEnd);
    const elapsed = performance.now() - downMs;
    const isClick = e.type === "pointerup" && downButton === 0 && finalSq < 36 && elapsed < 350;

    if (isClick) {
      flipped = !flipped;
      claspVel.set(0, 0, 0);
      dragVel.set(0, 0, 0);
      if (reduce) {
        cardState.ry = flipped ? Math.PI : 0;
        cardState.oy = 0;
        renderFrame();
        return;
      }
      const d = angleDiff(flipped ? Math.PI : 0, cardState.ry);
      cardState.oy = (d >= 0 ? 1 : -1) * 9.2;
      markActive(2400);
      return;
    }

    claspVel.x = Math.max(-5.5, Math.min(5.5, dragVel.x * 0.42));
    claspVel.y = Math.max(-3.8, Math.min(3.8, dragVel.y * 0.32));
    cardState.oy += Math.max(-5.2, Math.min(5.2, -dragVel.x * 0.32));
    cardState.oz += Math.max(-2.8, Math.min(2.8, dragVel.x * 0.12));
    markActive(3800);
  };

  const onCanvasDown = (e: PointerEvent) => {
    rectDirty = true;
    if (!hitCard(e.clientX, e.clientY)) return;
    e.preventDefault();
    grabbed = true;
    downX = e.clientX;
    downY = e.clientY;
    downMs = performance.now();
    downButton = e.button;
    maxMoveSq = 0;
    hitSurface.style.touchAction = "none";
    hitSurface.style.cursor = "grabbing";
    hitSurface.setPointerCapture(e.pointerId);

    screenToWorldOnPlane(e.clientX, e.clientY, claspPos.z, grabTarget);
    const cardCenterX = claspPos.x + Math.sin(cardState.rz) * claspPivotY;
    const cardCenterY = claspPos.y - Math.cos(cardState.rz) * claspPivotY;
    grabClaspOffset.set(cardCenterX - grabTarget.x, cardCenterY - grabTarget.y, 0);
    prevDragPos.copy(grabTarget);
    dragVel.set(0, 0, 0);
    lastMoveMs = performance.now();

    window.addEventListener("pointermove", onWindowMove, { passive: true });
    window.addEventListener("pointerup", releaseGrab);
    window.addEventListener("pointercancel", releaseGrab);
    markActive(3000);
  };

  const onCanvasMove = (e: PointerEvent) => {
    if (grabbed) return;
    const isHit = hitCard(e.clientX, e.clientY);
    if (isHit !== hover) {
      hover = isHit;
      hitSurface.style.cursor = hover ? "grab" : "";
      if (hover) markActive(250);
    }
  };

  const onCanvasLeave = () => {
    if (!grabbed && hover) {
      hover = false;
      hitSurface.style.cursor = "";
    }
  };

  hitSurface.style.touchAction = "pan-y";
  hitSurface.addEventListener("pointerenter", invalidateRect, { passive: true });
  hitSurface.addEventListener("pointerdown", onCanvasDown);
  hitSurface.addEventListener("pointermove", onCanvasMove, { passive: true });
  hitSurface.addEventListener("pointerleave", onCanvasLeave);

  const stepPhysicsFull = (dt: number, nowSec: number) => {
    dragVel.scale(Math.pow(0.0005, dt));

    const subSteps = 5;
    const h = dt / subSteps;
    const tangDamp = Math.pow(Math.max(0.16, 1 - damping * 0.74), h);
    const zDamp = 5.0 + damping * 2.8;
    const rollDamp = 5.2 + damping * 3.4;
    const yawDampPow = Math.max(0.008, 0.032 - damping * 0.022);
    const breezeX = breeze * (0.38 * Math.sin(nowSec * 0.95) + 0.18 * Math.sin(nowSec * 1.8 + 1.1));
    const breezeZ = breeze * (0.12 * Math.cos(nowSec * 0.78 + 0.6));
    const gravity = -24.0;

    for (let s = 0; s < subSteps; s++) {
      if (grabbed) {
        const wantCardX = grabTarget.x + grabClaspOffset.x;
        const wantCardY = grabTarget.y + grabClaspOffset.y;
        const pullAngle = Math.atan2(wantCardX, Math.max(0.4, topAnchorY - wantCardY));
        const velTilt = Math.max(-0.14, Math.min(0.14, dragVel.x * 0.014));
        const targetRz = Math.max(-0.42, Math.min(0.42, pullAngle * 0.34 + velTilt));
        const targetRx = Math.max(-0.22, Math.min(0.22, 0.05 - dragVel.y * 0.012));

        cardState.rz += (targetRz - cardState.rz) * (1 - Math.pow(0.0001, h));
        cardState.rx += (targetRx - cardState.rx) * (1 - Math.pow(0.0005, h));
        cardState.oz = 0;

        const rawClaspX = wantCardX - Math.sin(cardState.rz) * claspPivotY;
        const rawClaspY = Math.min(topAnchorY - 0.14, wantCardY + Math.cos(cardState.rz) * claspPivotY);
        const cdx = rawClaspX;
        const cdy = rawClaspY - topAnchorY;
        const cDist = Math.hypot(cdx, cdy) || 1e-5;
        const maxElastic = strapDrop * (0.06 + elasticity * 0.45);

        let destClaspX = rawClaspX;
        let destClaspY = rawClaspY;
        if (cDist > strapDrop) {
          const over = cDist - strapDrop;
          const allowed = strapDrop + maxElastic * Math.tanh(over / Math.max(0.08, maxElastic * 2.2));
          destClaspX = (cdx / cDist) * allowed;
          destClaspY = Math.min(topAnchorY - 0.14, topAnchorY + (cdy / cDist) * allowed);
        }

        const follow = 1 - Math.pow(0.00003, h);
        claspVel.set(((destClaspX - claspPos.x) / h) * 0.22, ((destClaspY - claspPos.y) / h) * 0.22, 0);
        claspPos.x += (destClaspX - claspPos.x) * follow;
        claspPos.y += (destClaspY - claspPos.y) * follow;
        claspPos.z += (0.14 - claspPos.z) * follow;
      } else {
        claspVel.x += breezeX * h;
        claspVel.y += gravity * h;
        claspVel.z += (breezeZ - claspPos.z * 14.0 - claspVel.z * zDamp) * h;

        claspPos.x += claspVel.x * h;
        claspPos.y += claspVel.y * h;
        claspPos.z += claspVel.z * h;

        const dx = claspPos.x;
        const dy = claspPos.y - topAnchorY;
        const dz = claspPos.z;
        const dist = Math.hypot(dx, dy, dz) || 1e-5;

        if (dist > strapDrop) {
          const ux = dx / dist;
          const uy = dy / dist;
          const uz = dz / dist;
          const stretch = dist - strapDrop;
          const relax = 1 - Math.min(0.35, elasticity * 0.9);
          const corr = stretch * relax;
          claspPos.x -= ux * corr;
          claspPos.y -= uy * corr;
          claspPos.z -= uz * corr;

          const vRad = claspVel.x * ux + claspVel.y * uy + claspVel.z * uz;
          if (vRad > 0) {
            const bounce = Math.min(0.15, elasticity * 0.4);
            claspVel.x -= ux * vRad * (1 + bounce);
            claspVel.y -= uy * vRad * (1 + bounce);
            claspVel.z -= uz * vRad * (1 + bounce);
          }
        }

        claspVel.x *= tangDamp;
        claspVel.y *= tangDamp;

        const strapAngle = Math.atan2(claspPos.x, Math.max(0.2, topAnchorY - claspPos.y));
        const eqRz = strapAngle * 0.48 + Math.max(-0.18, Math.min(0.18, claspVel.x * 0.045));
        const angAcc = (eqRz - cardState.rz) * 48.0 - cardState.oz * rollDamp;
        cardState.oz += angAcc * h;
        cardState.rz = Math.max(-0.7, Math.min(0.7, cardState.rz + cardState.oz * h));

        const targetRx = 0.02 + Math.max(-0.18, Math.min(0.18, -claspVel.y * 0.018));
        cardState.rx += (targetRx - cardState.rx) * (1 - Math.pow(0.002, h));
      }

      nodes[0].set(0, topAnchorY, 0);
      nodes[NODES - 1].copy(claspPos);
      prevNodes[NODES - 1].copy(claspPos);

      const chordDist = Math.hypot(claspPos.x, claspPos.y - topAnchorY, claspPos.z);
      const dynSegLen = Math.max(strapDrop, chordDist) / (NODES - 1);

      for (let i = 1; i < NODES - 1; i++) {
        const cur = nodes[i];
        const prev = prevNodes[i];
        const vx = (cur.x - prev.x) * 0.9;
        const vy = (cur.y - prev.y) * 0.9;
        const vz = (cur.z - prev.z) * 0.9;
        prev.copy(cur);
        cur.x += vx + breezeX * 0.25 * h * h;
        cur.y += vy + gravity * 0.65 * h * h;
        cur.z += vz;
      }

      for (let k = 0; k < 6; k++) {
        nodes[0].set(0, topAnchorY, 0);
        nodes[NODES - 1].copy(claspPos);
        for (let i = 0; i < NODES - 1; i++) {
          const a = nodes[i];
          const b = nodes[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dz = b.z - a.z;
          const d = Math.hypot(dx, dy, dz) || 1e-5;
          const diff = (d - dynSegLen) / d;
          if (i === 0) {
            b.x -= dx * diff;
            b.y -= dy * diff;
            b.z -= dz * diff;
          } else if (i === NODES - 2) {
            a.x += dx * diff;
            a.y += dy * diff;
            a.z += dz * diff;
          } else {
            const half = diff * 0.5;
            a.x += dx * half;
            a.y += dy * half;
            a.z += dz * half;
            b.x -= dx * half;
            b.y -= dy * half;
            b.z -= dz * half;
          }
        }
      }
    }

    const baseYaw = flipped ? Math.PI : 0;
    if (grabbed) {
      cardState.oy += Math.max(-14, Math.min(14, -dragVel.x * 1.45 * dt)) + angleDiff(baseYaw, cardState.ry) * 4.5 * dt;
    } else {
      const restRy = baseYaw + breeze * 0.08 * Math.sin(nowSec * 0.8 + 0.5);
      cardState.oy += angleDiff(restRy, cardState.ry) * 24.0 * dt;
    }
    cardState.oy *= Math.pow(grabbed ? 0.03 : yawDampPow, dt);
    cardState.ry += cardState.oy * dt;
  };

  // Closed-form gentle idle sway: zero Verlet substeps or constraint passes at rest
  const stepIdleBreeze = (nowSec: number) => {
    const swayX = breeze * (0.022 * Math.sin(nowSec * 0.95) + 0.008 * Math.sin(nowSec * 1.8 + 1.1));
    const swayZ = breeze * 0.008 * Math.cos(nowSec * 0.78 + 0.6);
    const dy = Math.sqrt(Math.max(0.01, strapDrop * strapDrop - swayX * swayX - swayZ * swayZ));
    claspPos.set(swayX, topAnchorY - dy, swayZ);
    claspVel.set(0, 0, 0);

    cardState.rz = (swayX / strapDrop) * 0.48;
    cardState.rx = 0.02;
    cardState.ry = (flipped ? Math.PI : 0) + breeze * 0.08 * Math.sin(nowSec * 0.8 + 0.5);
    cardState.ox = 0;
    cardState.oy = 0;
    cardState.oz = 0;

    for (let i = 0; i < NODES; i++) {
      const u = i / (NODES - 1);
      nodes[i].set(swayX * u, topAnchorY - dy * u, swayZ * u);
      prevNodes[i].copy(nodes[i]);
    }
  };

  const renderFrame = (forceStrap = false) => {
    nodes[NODES - 1].copy(claspPos);
    cardGroup.position.copy(claspPos);
    cardGroup.rotation.set(cardState.rx, cardState.ry, cardState.rz);
    updateStrapGeometry(forceStrap);
    scene.updateMatrixWorld();
    updateHitBounds();
    renderer.render({ scene, camera, update: false, sort: false, frustumCull: false });
  };

  const frame = () => {
    if (!alive || document.hidden || !isVisible) {
      raf = 0;
      return;
    }

    const nowMs = performance.now();
    const motionMag =
      Math.abs(claspVel.x) +
      Math.abs(claspVel.y) +
      Math.abs(claspVel.z) +
      Math.abs(cardState.ox) +
      Math.abs(cardState.oy) +
      Math.abs(cardState.oz);
    const baseYaw = flipped ? Math.PI : 0;
    const dev = Math.abs(claspPos.x) + Math.abs(cardState.rz) + Math.abs(claspPos.z) + Math.abs(angleDiff(baseYaw, cardState.ry));

    const kineticActive = grabbed || motionMag > 0.015 || dev > 0.025 || nowMs < activeUntilMs;

    if (!kineticActive) {
      if (breeze <= 0.001) {
        // Completely settled with no breeze: snap to rest, render once, and sleep at 0 FPS
        resetChain();
        renderFrame();
        raf = 0;
        return;
      }
      // Subtle visible breeze throttled to ~15fps matching hero rack idle cadence
      if (nowMs - lastRenderMs < 66) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastMs = nowMs;
      lastRenderMs = nowMs;
      stepIdleBreeze(nowMs * 0.001);
      renderFrame();
      raf = requestAnimationFrame(frame);
      return;
    }

    const dt = Math.min(0.033, Math.max(0.001, (nowMs - lastMs) * 0.001));
    lastMs = nowMs;
    lastRenderMs = nowMs;

    stepPhysicsFull(dt, nowMs * 0.001);
    renderFrame();
    raf = requestAnimationFrame(frame);
  };

  loopReady = true;

  const io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          (entries) => {
            const visibleNow = entries.some((entry) => entry.isIntersecting);
            if (visibleNow === isVisible) return;
            isVisible = visibleNow;
            if (!isVisible && raf) {
              cancelAnimationFrame(raf);
              raf = 0;
            } else if (isVisible) {
              invalidateRect();
              wakeLoop();
            }
          },
          { threshold: 0.01 },
        )
      : null;
  io?.observe(canvas);

  const onVisibilityChange = () => {
    if (document.hidden) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    } else if (alive && !reduce && isVisible) {
      lastMs = performance.now();
      markActive(1000);
    }
  };
  document.addEventListener("visibilitychange", onVisibilityChange);

  renderFrame(true);
  if (!reduce) {
    raf = requestAnimationFrame(frame);
  }

  return {
    destroy() {
      alive = false;
      window.clearTimeout(readyGuardTimer);
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro.disconnect();
      dprMql?.removeEventListener("change", onDprChange);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", solveCamera);
      hitSurface.removeEventListener("pointerenter", invalidateRect);
      hitSurface.removeEventListener("pointerdown", onCanvasDown);
      hitSurface.removeEventListener("pointermove", onCanvasMove);
      hitSurface.removeEventListener("pointerleave", onCanvasLeave);
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", releaseGrab);
      window.removeEventListener("pointercancel", releaseGrab);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      portraitImg.onload = null;
      portraitImg.onerror = null;

      facesGeo.remove();
      hardwareGeo.remove();
      strapGeo.remove();
      gl.deleteTexture(atlasTex.texture);
      gl.deleteProgram(cardProg.program);
      gl.deleteProgram(metalProg.program);
      gl.deleteProgram(strapProg.program);
    },
  };
}
