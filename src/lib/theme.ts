export type RgbTuple = [number, number, number];
export type Vec3Tuple = [number, number, number];

export interface ThemeTokens {
  rack: string;
  rackHi: string;
  rackGlow: string;
  ink2: string;
  panel: string;
  face: string;
  faceHi: string;
  slot: string;
  paper: string;
  paperDim: string;
  dim: string;
  led: string;
  amber: string;
  ember: string;
  accentDeep: string;
  ice: string;
  cursorHover: string;
  trailOuter: string;
  trailCore: string;
  chipHi: string;
  chipMid: string;
  chipLo: string;
}

/**
 * Fallback hex values synchronized with `@theme` and `:root` in `src/styles/global.css`.
 * At runtime in the browser, `getThemeTokens()` resolves live CSS custom properties first.
 */
export const DEFAULT_THEME: ThemeTokens = {
  rack: "#0c0e11",
  rackHi: "#13171b",
  rackGlow: "#15191f",
  ink2: "#121519",
  panel: "#0d1014",
  face: "#1b1f25",
  faceHi: "#242930",
  slot: "#07090b",
  paper: "#ede7de",
  paperDim: "#aca59b",
  dim: "#928b82",
  led: "#5fd97a",
  amber: "#b4b5e6",
  ember: "#8c8fd4",
  accentDeep: "#484b9e",
  ice: "#667e99",
  cursorHover: "#c9caeb",
  trailOuter: "#8588c8",
  trailCore: "#b2b4e4",
  chipHi: "#d8a256",
  chipMid: "#b37c36",
  chipLo: "#7c5222",
};

const CSS_VAR_MAP: Record<keyof ThemeTokens, string> = {
  rack: "--color-rack",
  rackHi: "--color-rack-hi",
  rackGlow: "--color-rack-glow",
  ink2: "--color-ink-2",
  panel: "--color-panel",
  face: "--color-face",
  faceHi: "--color-face-hi",
  slot: "--color-slot",
  paper: "--color-paper",
  paperDim: "--color-paper-dim",
  dim: "--color-dim",
  led: "--color-led",
  amber: "--color-amber",
  ember: "--color-ember",
  accentDeep: "--color-accent-deep",
  ice: "--color-ice",
  cursorHover: "--color-cursor-hover",
  trailOuter: "--color-trail-outer",
  trailCore: "--color-trail-core",
  chipHi: "--color-chip-hi",
  chipMid: "--color-chip-mid",
  chipLo: "--color-chip-lo",
};

function parseCssColorToHex(raw: string, fallback: string): string {
  const val = raw.trim();
  if (!val) return fallback;
  if (/^#[0-9a-fA-F]{6}$/.test(val)) return val;
  if (/^#[0-9a-fA-F]{3}$/.test(val)) {
    return `#${val[1]}${val[1]}${val[2]}${val[2]}${val[3]}${val[3]}`;
  }
  const m = val.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (m) {
    const toHex = (n: string) =>
      Math.max(0, Math.min(255, Math.round(Number(n))))
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
  }
  return fallback;
}

export function hexToRgbTuple(hex: string): RgbTuple {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export function hexToVec3(hex: string): Vec3Tuple {
  const [r, g, b] = hexToRgbTuple(hex);
  return [r / 255, g / 255, b / 255];
}

export function hexToRgbCss(hex: string): string {
  const [r, g, b] = hexToRgbTuple(hex);
  return `${r}, ${g}, ${b}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  return `rgba(${hexToRgbCss(hex)}, ${alpha})`;
}

/**
 * Resolve all theme colors from CSS custom properties on `document.documentElement`,
 * falling back cleanly to `DEFAULT_THEME` during SSR or pre-paint scripts.
 */
export function getThemeTokens(): ThemeTokens {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const styles = getComputedStyle(document.documentElement);
  const resolved = { ...DEFAULT_THEME };
  (Object.keys(CSS_VAR_MAP) as Array<keyof ThemeTokens>).forEach((key) => {
    const raw = styles.getPropertyValue(CSS_VAR_MAP[key]);
    resolved[key] = parseCssColorToHex(raw, DEFAULT_THEME[key]);
  });
  return resolved;
}

export interface ScenePalette {
  tokens: ThemeTokens;
  rack: {
    keyLight: Vec3Tuple;
    fillLight: Vec3Tuple;
    ambient: Vec3Tuple;
    floorKeyLight: Vec3Tuple;
    floorAmbient: Vec3Tuple;
    rimColor: Vec3Tuple;
    uidActiveDelta: Vec3Tuple;
    uidBase: Vec3Tuple;
    slotInactive: Vec3Tuple;
    slotActiveDelta: Vec3Tuple;
    cableTrunkAccent: Vec3Tuple;
    cableAuxPrimary: Vec3Tuple;
    cableAuxSecondary: Vec3Tuple;
    cablePatchPrimary: Vec3Tuple;
    cablePatchSecondary: Vec3Tuple;
    cableConduitAccent: Vec3Tuple;
    knobIndicator: Vec3Tuple;
    pinMetal: Vec3Tuple;
    pinMetalCss: string;
    auxRing: Vec3Tuple;
    auxRingCss: string;
    coaxRingCss: string;
    oledBg: string;
    oledBorder: string;
    oledGridCss: string;
    oledTelemetryCss: string;
    oledWaveSecondaryCss: string;
    oledWaveHaloCss: string;
    oledWaveCoreCss: string;
    plenumTop: string;
    plenumMid: string;
    plenumBot: string;
    plenumTintCss: string;
    ejectButtonCss: string;
    eveLedBase: Vec3Tuple;
    eveRibbonCss: string;
    eveSparkles: [string, string, string];
  };
  lanyard: {
    keyLight: Vec3Tuple;
    fillLight: Vec3Tuple;
    ambient: Vec3Tuple;
    metalRim: Vec3Tuple;
    satinSpec: Vec3Tuple;
    fresnelRim: Vec3Tuple;
    foilHighlight: Vec3Tuple;
    foilAccent: Vec3Tuple;
    foilPaper: Vec3Tuple;
    foilIce: Vec3Tuple;
    stripeStops: [string, string, string];
    stripeTraceCss: string;
    chipStops: [string, string, string];
  };
}

export function getScenePalette(tokens: ThemeTokens = getThemeTokens()): ScenePalette {
  const accentDeepVec = hexToVec3(tokens.accentDeep);
  const emberVec = hexToVec3(tokens.ember);
  const amberVec = hexToVec3(tokens.amber);
  const paperVec = hexToVec3(tokens.paper);
  const iceVec = hexToVec3(tokens.ice);

  // Soft desaturated twilight indigo accents with feathered studio key/fill lighting
  const cableIndigo: Vec3Tuple = [
    Math.min(1, accentDeepVec[0] * 0.94),
    Math.min(1, accentDeepVec[1] * 0.94),
    Math.min(1, accentDeepVec[2] * 0.96),
  ];

  return {
    tokens,
    rack: {
      keyLight: [1.36, 1.18, 0.98],
      fillLight: [0.22, 0.28, 0.46],
      ambient: [0.078, 0.082, 0.098],
      floorKeyLight: [1.18, 1.04, 0.88],
      floorAmbient: [0.1, 0.11, 0.128],
      rimColor: [0.56, 0.56, 0.84],
      uidActiveDelta: [0.26, 0.36, 0.72],
      uidBase: [0.1, 0.13, 0.18],
      slotInactive: [0.16, 0.18, 0.2],
      slotActiveDelta: [
        emberVec[0] - 0.16,
        emberVec[1] - 0.18,
        emberVec[2] - 0.2,
      ],
      cableTrunkAccent: cableIndigo,
      cableAuxPrimary: cableIndigo,
      cableAuxSecondary: [0.44, 0.45, 0.74],
      cablePatchPrimary: cableIndigo,
      cablePatchSecondary: [0.46, 0.47, 0.75],
      cableConduitAccent: [accentDeepVec[0] * 0.74, accentDeepVec[1] * 0.74, accentDeepVec[2] * 0.72],
      knobIndicator: emberVec,
      pinMetal: [0.82, 0.66, 0.3],
      pinMetalCss: "#c99e48",
      auxRing: emberVec,
      auxRingCss: tokens.ember,
      coaxRingCss: "#cdd3d9",
      oledBg: "#06090c",
      oledBorder: "#262c34",
      oledGridCss: hexToRgba(tokens.led, 0.09),
      oledTelemetryCss: "#88af9e",
      oledWaveSecondaryCss: hexToRgba(tokens.led, 0.36),
      oledWaveHaloCss: hexToRgba(tokens.ember, 0.28),
      oledWaveCoreCss: tokens.amber,
      plenumTop: "#10212b",
      plenumMid: "#090f14",
      plenumBot: "#050709",
      plenumTintCss: "rgba(110, 168, 196, 0.07)",
      ejectButtonCss: "#2d3054",
      eveLedBase: [0.88, 0.68, 0.28],
      eveRibbonCss: tokens.ember,
      eveSparkles: ["#f9d67a", "#ffe9a8", "#e0a34a"],
    },
    lanyard: {
      keyLight: [1.32, 1.16, 0.96],
      fillLight: [0.26, 0.31, 0.52],
      ambient: [0.25, 0.255, 0.27],
      metalRim: [0.62, 0.62, 0.86],
      satinSpec: paperVec,
      fresnelRim: amberVec,
      foilHighlight: amberVec,
      foilAccent: [0.45, 0.46, 0.78],
      foilPaper: paperVec,
      foilIce: iceVec,
      stripeStops: [
        hexToRgba(tokens.amber, 0.08),
        hexToRgba(tokens.accentDeep, 0.2),
        hexToRgba(tokens.ice, 0.07),
      ],
      stripeTraceCss: hexToRgba(tokens.ember, 0.68),
      chipStops: [tokens.chipHi, tokens.chipMid, tokens.chipLo],
    },
  };
}
