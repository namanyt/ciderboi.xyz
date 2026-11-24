import { getThemeTokens, hexToRgbTuple } from "./theme";

export const BAYER_CELL = 6;

// Normalized 8x8 Bayer ordered dithering thresholds in (0, 1)
export const BAYER_8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((v) => (v + 0.5) / 64));

/** Pack RGBA channels [0..255] into native endianness Uint32 for ImageData buffer fills. */
export function packRgba(r: number, g: number, b: number, a = 255): number {
  const u32 = new Uint32Array(1);
  const u8 = new Uint8ClampedArray(u32.buffer);
  u8[0] = r;
  u8[1] = g;
  u8[2] = b;
  u8[3] = a;
  return u32[0];
}

/** Pack `--color-slot` at full opacity into native endianness Uint32 for ImageData buffer fills. */
export function getPackedSlotColor(): number {
  const [r, g, b] = hexToRgbTuple(getThemeTokens().slot);
  return packRgba(r, g, b, 255);
}
