import { Point } from '@world/primitives';

export function getNearestPoint(target: Point, points: Point[], threshold = Number.MAX_SAFE_INTEGER): Point {
  let minDist = Number.MAX_SAFE_INTEGER;
  let nearest = null;
  for (const source of points) {
    const dist = distance(source, target);
    if (dist < minDist && dist < threshold) {
      minDist = dist;
      nearest = source;
    }
  }
  return nearest;
}

export function distance(p1: Point, p2: Point) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function subtract(p1: Point, p2: Point) {
  return new Point(p1.x - p2.x, p1.y - p2.y);
}

export function add(p1: Point, p2: Point) {
  return new Point(p1.x + p2.x, p1.y + p2.y);
}

export function scale(p: Point, scaler: number) {
  return new Point(p.x * scaler, p.y * scaler);
}
