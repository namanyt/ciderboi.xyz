import { BAYER_8, BAYER_CELL, getPackedSlotColor } from "./bayer";

export type BootCurtainController = {
  setStage: (label: string, progress: number) => void;
  finish: (opts?: { instant?: boolean }) => void;
};

const CELL = BAYER_CELL;
const DISSOLVE_MS = 1000;
const PACKED_BLACK = getPackedSlotColor();

/** Drives the initial solid-black rack boot curtain and its 1s Bayer dither dissolve. */
export function createBootCurtain(): BootCurtainController {
  const curtain = document.querySelector<HTMLElement>("[data-boot-curtain]");
  const canvas = curtain?.querySelector<HTMLCanvasElement>("[data-boot-canvas]");
  const hud = curtain?.querySelector<HTMLElement>("[data-boot-hud]");
  const statusEl = curtain?.querySelector<HTMLElement>("[data-boot-status]");
  const ledEl = curtain?.querySelector<HTMLElement>("[data-boot-led]");
  const barEl = curtain?.querySelector<HTMLElement>("[data-boot-bar]");

  let progressMax = 0.08;
  let finished = false;
  let rafId = 0;

  const clearFailsafe = () => {
    const timer = (window as unknown as { __bootFailsafe?: number }).__bootFailsafe;
    if (timer) {
      window.clearTimeout(timer);
      (window as unknown as { __bootFailsafe?: number }).__bootFailsafe = 0;
    }
  };

  const setStage = (label: string, progress: number) => {
    if (!curtain || finished) return;
    if (statusEl) statusEl.textContent = label;
    progressMax = Math.max(progressMax, Math.min(1, progress));
    if (barEl) barEl.style.transform = `scaleX(${progressMax.toFixed(3)})`;
  };

  const teardown = () => {
    clearFailsafe();
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener("resize", rebuildGrid);
    curtain?.remove();
  };

  let cols = 0;
  let rows = 0;
  let width = 0;
  let height = 0;
  let thresholds = new Float32Array(0);
  let imgData: ImageData | null = null;
  let pixels = new Uint32Array(0);
  const bufCanvas = document.createElement("canvas");
  const bufCtx = bufCanvas.getContext("2d");
  const ctx = canvas?.getContext("2d");

  const rebuildGrid = () => {
    if (!canvas || !ctx || !bufCtx) return;
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = width;
    canvas.height = height;

    cols = Math.max(1, Math.ceil(width / CELL));
    rows = Math.max(1, Math.ceil(height / CELL));
    bufCanvas.width = cols;
    bufCanvas.height = rows;

    imgData = bufCtx.createImageData(cols, rows);
    pixels = new Uint32Array(imgData.data.buffer);
    thresholds = new Float32Array(cols * rows);

    // Subtle radial lead centered near the 3D rack focal zone so ordered Bayer blocks punch open organically
    const isSplit = document.documentElement.dataset.layout === "split";
    const cx = cols * (isSplit ? 0.62 : 0.5);
    const cy = rows * 0.48;
    const maxDist = Math.max(
      1,
      Math.hypot(Math.max(cx, cols - cx), Math.max(cy, rows - cy)),
    );

    let idx = 0;
    for (let r = 0; r < rows; r++) {
      const bRow = BAYER_8[r & 7];
      const dy = r - cy;
      for (let c = 0; c < cols; c++) {
        const bayer = bRow[c & 7];
        const radial = Math.min(1, Math.hypot(c - cx, dy) / maxDist);
        thresholds[idx++] = bayer * 0.8 + radial * 0.2;
      }
    }
  };

  const renderDensity = (density: number) => {
    if (!ctx || !bufCtx || !imgData) return;
    if (density >= 1) {
      pixels.fill(PACKED_BLACK);
    } else if (density <= 0) {
      pixels.fill(0);
    } else {
      const total = pixels.length;
      for (let i = 0; i < total; i++) {
        pixels[i] = density > thresholds[i] ? PACKED_BLACK : 0;
      }
    }
    bufCtx.putImageData(imgData, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bufCanvas, 0, 0, cols * CELL, rows * CELL);
  };

  const finish = (opts?: { instant?: boolean }) => {
    if (!curtain || finished) return;
    finished = true;
    clearFailsafe();

    if (ledEl) {
      ledEl.classList.remove("bg-ember", "animate-pulse");
      ledEl.classList.add("bg-led");
      ledEl.style.boxShadow = "0 0 8px color-mix(in srgb, var(--color-led) 75%, transparent)";
    }
    if (statusEl) statusEl.textContent = "ONLINE // READY";
    if (barEl) barEl.style.transform = "scaleX(1)";

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (opts?.instant || reduce || !canvas || !ctx || !bufCtx) {
      teardown();
      return;
    }

    rebuildGrid();
    renderDensity(1);

    // Swap responsibility from opaque CSS background to ordered Bayer canvas pixels before fading down to 0
    curtain.style.backgroundColor = "transparent";
    if (hud) {
      hud.style.transition = "opacity 180ms ease-out, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
      hud.style.opacity = "0";
      hud.style.transform = "translate3d(0, -4px, 0)";
    }

    window.addEventListener("resize", rebuildGrid);
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / DISSOLVE_MS));
      // Smooth cosine curve 1.0 -> 0.0: gentle launch out of solid black, crisp Bayer stippling mid-flight
      const density = 0.5 * (1 + Math.cos(Math.PI * t));
      renderDensity(density);
      if (t >= 1) {
        teardown();
        return;
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
  };

  return { setStage, finish };
}
