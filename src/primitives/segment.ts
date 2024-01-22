import { add, distance, dot, magnitude, normalize, scale, subtract } from '@world/math';
import { Point } from './point';

export class Segment {
  constructor(public p1: Point, public p2: Point) { }

  length() {
    return distance(this.p1, this.p2);
  }

  directionVector() {
    return normalize(subtract(this.p2, this.p1));
  }

  equals(segment: Segment) {
    return this.includes(segment.p1) && this.includes(segment.p2);
  }

  distanceToPoint(point: Point) {
    const proj = this.projectPoint(point);
    if (proj.offset > 0 && proj.offset < 1) {
      return distance(point, proj.point);
    }
    const distToP1 = distance(point, this.p1);
    const distToP2 = distance(point, this.p2);
    return Math.min(distToP1, distToP2);
  }

  projectPoint(point: Point) {
    const a = subtract(point, this.p1);
    const b = subtract(this.p2, this.p1);
    const normB = normalize(b);
    const scaler = dot(a, normB);
    const proj = {
      point: add(this.p1, scale(normB, scaler)),
      offset: scaler / magnitude(b),
    };
    return proj;
  }

  includes(point: Point) {
    return this.p1.equals(point) || this.p2.equals(point);
  }

  draw(ctx: CanvasRenderingContext2D, { width = 2, color = 'black', dash = Array.of(0), cap = 'butt' } = {}) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.lineCap = cap as CanvasLineCap;
    ctx.setLineDash(dash);
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
