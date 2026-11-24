import { BAYER_8, BAYER_CELL, getPackedSlotColor, packRgba } from "./bayer";
import { getThemeTokens, hexToRgbTuple } from "./theme";

const SWEEP_CELL = BAYER_CELL;
const COVER_MS = 350;
const REVEAL_MS = 380;
const SLOW_HUD_DELAY_MS = 430;
const READY_TIMEOUT_MS = 3200;
const HARD_FAILSAFE_MS = 5000;
const FEATHER = 0.4;
const FRONTIER_BAND = 0.14;
const MID_BAND = 0.065;

const easeSweep = (t: number) => 0.72 * t + 0.28 * (0.5 * (1 - Math.cos(Math.PI * t)));

function getSweepPalette() {
  const tokens = getThemeTokens();
  const [rhR, rhG, rhB] = hexToRgbTuple(tokens.rackHi);
  const [adR, adG, adB] = hexToRgbTuple(tokens.accentDeep);
  const [emR, emG, emB] = hexToRgbTuple(tokens.ember);

  const mix = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);
  return {
    slot: getPackedSlotColor(),
    mid: packRgba(mix(rhR, adR, 0.28), mix(rhG, adG, 0.28), mix(rhB, adB, 0.28), 238),
    rim: packRgba(mix(adR, emR, 0.46), mix(adG, emG, 0.46), mix(adB, emB, 0.46), 148),
  };
}

type SweepDirection = 1 | -1;

type RouteBridge = {
  __routeSweepActive?: boolean;
  __routeSweepBound?: boolean;
  __pendingRouteReady?: Promise<unknown> | null;
  __setRouteStage?: (label: string, progress: number) => void;
  __syncLenis?: (enabled: boolean) => void;
  __syncPageScroll?: () => void;
};

const bridge = () => window as unknown as RouteBridge;

export function getRouteRank(pathname: string): number {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") return 0;
  if (clean === "/work") return 1;
  if (clean.startsWith("/work/")) return 1.25;
  if (clean === "/music") return 1.6;
  if (clean === "/about") return 2;
  if (clean === "/resume") return 3;
  if (clean === "/contact") return 4;
  return 2.5;
}

function formatRouteLabel(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") return "RACK // HOME";
  if (clean.startsWith("/work/")) return `WORK // ${clean.slice(6).toUpperCase()}`;
  return `ROUTE // ${clean.slice(1).toUpperCase()}`;
}

export function resolveHomeRootAttributes(root: HTMLElement) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / Math.max(1, h);
  const layout = w >= 960 && h >= 540 && aspect >= 1.02 ? "split" : "window";
  root.dataset.layout = layout;
  root.dataset.windowFrame = w >= 560 && h >= 640 ? "floating" : "compact";
  root.dataset.windowOpen = "true";
}

function resolveSweepDirection(
  fromPath: string,
  toPath: string,
  navDirection?: string,
  navType?: string,
): SweepDirection {
  const fromRank = getRouteRank(fromPath);
  const toRank = getRouteRank(toPath);
  if (fromRank !== toRank) return toRank > fromRank ? 1 : -1;
  return navType === "traverse" && navDirection === "back" ? -1 : 1;
}

export function initRouteTransitions() {
  const b = bridge();
  if (b.__routeSweepBound) return;
  b.__routeSweepBound = true;

  const getEls = () => {
    const overlay = document.querySelector<HTMLElement>("[data-route-sweep]");
    const canvas = overlay?.querySelector<HTMLCanvasElement>("[data-route-sweep-canvas]");
    const hud = overlay?.querySelector<HTMLElement>("[data-route-sweep-hud]");
    const title = overlay?.querySelector<HTMLElement>("[data-route-sweep-title]");
    const dirEl = overlay?.querySelector<HTMLElement>("[data-route-sweep-dir]");
    const statusEl = overlay?.querySelector<HTMLElement>("[data-route-sweep-status]");
    const barEl = overlay?.querySelector<HTMLElement>("[data-route-sweep-bar]");
    return { overlay, canvas, hud, title, dirEl, statusEl, barEl };
  };

  let palette = getSweepPalette();
  let width = 0;
  let height = 0;
  let cols = 0;
  let rows = 0;
  let builtDir: SweepDirection | 0 = 0;
  let thresholds = new Float32Array(0);
  let imgData: ImageData | null = null;
  let pixels = new Uint32Array(0);
  const bufCanvas = document.createElement("canvas");
  const bufCtx = bufCanvas.getContext("2d");

  let phase: "idle" | "covering" | "covered" | "revealing" = "idle";
  let activeDir: SweepDirection = 1;
  let navToken = 0;
  let animRaf = 0;
  let slowHudTimer = 0;
  let failsafeTimer = 0;
  let hudProgress = 0.16;

  const rebuildGrid = (dir: SweepDirection, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    if (!bufCtx) return;
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    if (w !== width || h !== height || dir !== builtDir || pixels.length === 0) {
      width = w;
      height = h;
      builtDir = dir;
      palette = getSweepPalette();
      canvas.width = w;
      canvas.height = h;
      cols = Math.max(1, Math.ceil(w / SWEEP_CELL));
      rows = Math.max(1, Math.ceil(h / SWEEP_CELL));
      bufCanvas.width = cols;
      bufCanvas.height = rows;
      imgData = bufCtx.createImageData(cols, rows);
      pixels = new Uint32Array(imgData.data.buffer);
      thresholds = new Float32Array(cols * rows);

      const xDenom = Math.max(1, cols - 1);
      const yDenom = Math.max(1, rows - 1);
      const bowSpan = 0.04;
      const posSpan = 1 - FEATHER - bowSpan;
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        const bRow = BAYER_8[r & 7];
        const edgeBow = Math.abs(r / yDenom - 0.5) * bowSpan;
        for (let c = 0; c < cols; c++) {
          const xNorm = cols === 1 ? 0.5 : c / xDenom;
          const pos = dir === 1 ? xNorm : 1 - xNorm;
          thresholds[idx++] = pos * posSpan + bRow[c & 7] * FEATHER + edgeBow;
        }
      }
      void ctx;
    }
  };

  const drawSweep = (mode: "cover" | "reveal", ease: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    if (!bufCtx || !imgData) return;
    const fillFull = (mode === "cover" && ease >= 1) || (mode === "reveal" && ease <= 0);
    const clearFull = (mode === "cover" && ease <= 0) || (mode === "reveal" && ease >= 1);

    if (fillFull) {
      pixels.fill(palette.slot);
    } else if (clearFull) {
      pixels.fill(0);
    } else {
      const total = pixels.length;
      const { slot, mid, rim } = palette;
      if (mode === "cover") {
        const head = ease * (1 + FRONTIER_BAND);
        for (let i = 0; i < total; i++) {
          const diff = head - thresholds[i];
          pixels[i] =
            diff <= 0
              ? 0
              : diff >= FRONTIER_BAND
                ? slot
                : diff >= MID_BAND
                  ? mid
                  : rim;
        }
      } else {
        const head = -FRONTIER_BAND + ease * (1 + FRONTIER_BAND);
        for (let i = 0; i < total; i++) {
          const diff = thresholds[i] - head;
          pixels[i] =
            diff <= 0
              ? 0
              : diff >= FRONTIER_BAND
                ? slot
                : diff >= MID_BAND
                  ? mid
                  : rim;
        }
      }
    }

    bufCtx.putImageData(imgData, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bufCanvas, 0, 0, cols * SWEEP_CELL, rows * SWEEP_CELL);
  };

  const stopTimersAndRaf = () => {
    if (animRaf) {
      cancelAnimationFrame(animRaf);
      animRaf = 0;
    }
    window.clearTimeout(slowHudTimer);
    window.clearTimeout(failsafeTimer);
    slowHudTimer = 0;
    failsafeTimer = 0;
  };

  const resetOverlay = () => {
    stopTimersAndRaf();
    phase = "idle";
    b.__routeSweepActive = false;
    b.__pendingRouteReady = null;
    b.__setRouteStage = undefined;
    const { overlay, hud, canvas } = getEls();
    if (hud) hud.classList.replace("opacity-100", "opacity-0");
    if (overlay) {
      overlay.classList.add("hidden");
      overlay.classList.remove("flex");
    }
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const setHudStage = (label: string, progress: number) => {
    const { statusEl, barEl } = getEls();
    if (statusEl) statusEl.textContent = label;
    hudProgress = Math.max(hudProgress, Math.min(1, progress));
    if (barEl) barEl.style.transform = `scaleX(${hudProgress.toFixed(3)})`;
  };

  const scheduleSlowHud = () => {
    window.clearTimeout(slowHudTimer);
    slowHudTimer = window.setTimeout(() => {
      if (phase === "covered" || phase === "covering") {
        const { hud } = getEls();
        hud?.classList.remove("opacity-0");
        hud?.classList.add("opacity-100");
      }
    }, SLOW_HUD_DELAY_MS);
  };

  const runCover = (dir: SweepDirection, toPath: string) => {
    const { overlay, canvas, hud, title, dirEl, barEl } = getEls();
    const ctx = canvas?.getContext("2d");
    if (!overlay || !canvas || !ctx || !bufCtx) {
      phase = "covered";
      return Promise.resolve();
    }

    if (title) title.textContent = formatRouteLabel(toPath);
    if (dirEl) dirEl.textContent = dir > 0 ? "→" : "←";

    // If a slow fetch was aborted by a fresh click while already covered, keep the curtain closed seamlessly
    if (phase === "covered") {
      rebuildGrid(dir, canvas, ctx);
      drawSweep("reveal", 0, canvas, ctx);
      hudProgress = 0.18;
      setHudStage("REDIRECTING...", 0.24);
      scheduleSlowHud();
      return Promise.resolve();
    }

    stopTimersAndRaf();
    phase = "covering";
    hudProgress = 0.18;
    if (barEl) barEl.style.transform = "scaleX(0.18)";
    setHudStage("LOADING...", 0.18);
    if (hud) {
      hud.classList.add("opacity-0");
      hud.classList.remove("opacity-100");
    }

    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    rebuildGrid(dir, canvas, ctx);
    drawSweep("cover", 0, canvas, ctx);

    scheduleSlowHud();
    failsafeTimer = window.setTimeout(() => {
      if (phase !== "idle") resetOverlay();
    }, HARD_FAILSAFE_MS);

    return new Promise<void>((resolve) => {
      let t0 = 0;
      const step = (now: number) => {
        if (phase !== "covering") {
          resolve();
          return;
        }
        if (!t0) t0 = now - 16;
        const t = Math.min(1, Math.max(0, (now - t0) / COVER_MS));
        const ease = easeSweep(t);
        drawSweep("cover", ease, canvas, ctx);
        if (t >= 1) {
          animRaf = 0;
          phase = "covered";
          resolve();
          return;
        }
        animRaf = requestAnimationFrame(step);
      };
      animRaf = requestAnimationFrame(step);
    });
  };

  const runReveal = (dir: SweepDirection) => {
    const { overlay, canvas, hud } = getEls();
    const ctx = canvas?.getContext("2d");
    if (!overlay || !canvas || !ctx || !bufCtx) {
      resetOverlay();
      return;
    }

    window.clearTimeout(slowHudTimer);
    slowHudTimer = 0;
    if (animRaf) {
      cancelAnimationFrame(animRaf);
      animRaf = 0;
    }

    phase = "revealing";
    if (hud) {
      hud.classList.remove("opacity-100");
      hud.classList.add("opacity-0");
    }

    rebuildGrid(dir, canvas, ctx);
    drawSweep("reveal", 0, canvas, ctx);

    let t0 = 0;
    const step = (now: number) => {
      if (phase !== "revealing") return;
      if (!t0) t0 = now - 16;
      const t = Math.min(1, Math.max(0, (now - t0) / REVEAL_MS));
      const ease = easeSweep(t);
      drawSweep("reveal", ease, canvas, ctx);
      if (t >= 1) {
        resetOverlay();
        return;
      }
      animRaf = requestAnimationFrame(step);
    };
    animRaf = requestAnimationFrame(step);
  };

  document.addEventListener("astro:before-preparation", (rawEv) => {
    const ev = rawEv as Event & {
      from: URL;
      to: URL;
      direction: string;
      navigationType: string;
      loader: () => Promise<void>;
      signal: AbortSignal;
      defaultPrevented: boolean;
    };

    const samePath = ev.from.pathname === ev.to.pathname && ev.from.search === ev.to.search;
    if (samePath) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      b.__routeSweepActive = true;
      return;
    }

    const dir = resolveSweepDirection(ev.from.pathname, ev.to.pathname, ev.direction, ev.navigationType);
    const token = ++navToken;
    activeDir = dir;
    b.__routeSweepActive = true;
    b.__pendingRouteReady = null;
    b.__setRouteStage = (label, progress) => setHudStage(label, progress);

    const origLoader = ev.loader;
    const coverPromise = runCover(dir, ev.to.pathname);

    ev.loader = async () => {
      await Promise.all([origLoader(), coverPromise]);
      if (ev.signal.aborted || token !== navToken) return;
      if (ev.defaultPrevented) {
        setHudStage("RELOADING DOCUMENT...", 0.72);
        window.setTimeout(() => {
          if (token === navToken && phase !== "idle") resetOverlay();
        }, 1600);
        return;
      }
      setHudStage("SWAPPING VIEW...", 0.64);
    };
  });

  document.addEventListener("astro:before-swap", (rawEv) => {
    const ev = rawEv as Event & { to: URL; newDocument: Document };
    const cleanTo = ev.to.pathname.replace(/\/+$/, "") || "/";
    if (cleanTo === "/") {
      resolveHomeRootAttributes(ev.newDocument.documentElement);
      // RouteSweep already masks the transition; prevent duplicate boot curtain flash on SPA entry
      ev.newDocument.querySelector("[data-boot-curtain]")?.remove();
    } else {
      delete ev.newDocument.documentElement.dataset.layout;
      delete ev.newDocument.documentElement.dataset.windowFrame;
      delete ev.newDocument.documentElement.dataset.windowOpen;
    }
  });

  document.addEventListener("astro:after-swap", () => {
    b.__syncPageScroll?.();
  });

  document.addEventListener("astro:page-load", () => {
    if (!b.__routeSweepActive) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || phase === "idle") {
      resetOverlay();
      return;
    }

    const token = navToken;
    // Defer one microtask so destination page astro:page-load listeners register __pendingRouteReady first.
    Promise.resolve().then(() => {
      if (token !== navToken || !b.__routeSweepActive) return;

      const readyPromise = b.__pendingRouteReady;
      b.__pendingRouteReady = null;

      if (!readyPromise) {
        requestAnimationFrame(() => {
          if (token === navToken && (phase === "covered" || phase === "covering")) {
            runReveal(activeDir);
          }
        });
        return;
      }

      let settled = false;
      const finishReveal = () => {
        if (settled || token !== navToken) return;
        settled = true;
        setHudStage("ONLINE // READY", 1);
        if (phase === "covered" || phase === "covering") {
          runReveal(activeDir);
        }
      };

      const guard = window.setTimeout(finishReveal, READY_TIMEOUT_MS);
      Promise.resolve(readyPromise)
        .catch(() => {})
        .finally(() => {
          window.clearTimeout(guard);
          requestAnimationFrame(finishReveal);
        });
    });
  });
}
