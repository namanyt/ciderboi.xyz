export function cubicBezier(p0: number, p1: number, p2: number, p3: number) {
  return function (t: number): number {
    const cx = 3 * p0;
    const bx = 3 * (p2 - p0) - cx;
    const ax = 1 - cx - bx;

    const cy = 3 * p1;
    const by = 3 * (p3 - p1) - cy;
    const ay = 1 - cy - by;

    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
    const sampleCurveDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

    const solveCurveX = (x: number): number => {
      let t2 = x;
      for (let i = 0; i < 5; i++) {
        const x2 = sampleCurveX(t2) - x;
        const d2 = sampleCurveDerivativeX(t2);;
        if (Math.abs(x2) < 1e-6) return t2;
        if (d2 == 0) break;
        t2 -= x2 / d2;
      }
      return t2;
    }

    return sampleCurveY(solveCurveX(t));
  }
}

export function parse(easing: string) {
  easing = easing.trim().toLowerCase();
  if (Easing[easing]) return Easing[easing];

  const cubicMatch = easing.match(/cubic-bezier\(([^)]+)\)/);
  if (cubicMatch) {
    const values = cubicMatch[1].split(",").map(Number);
    if (values.length == 4) {
      return cubicBezier(values[0], values[1], values[2], values[3]);
    }
  }

  console.warn(`Easing function "${easing}" not found. Falling back to linear.`);
  return Easing.linear;
}

export const Easing: Record<string, (t:number) => number> = {
  linear: (t) => t,
  ease: cubicBezier(0.25, 0.1, 0.25, 1),
  "ease-in": cubicBezier(0.42, 0, 1, 1),
  "ease-out": cubicBezier(0, 0, 0.58, 1),
  "ease-in-out": cubicBezier(0.42, 0, 0.58, 1),
}



