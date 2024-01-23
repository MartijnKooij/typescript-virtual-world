import { angle, subtract, translate } from '@world/math';
import { Polygon } from './polygon';
import { Segment } from './segment';

export class Envelope {
  poly: Polygon;

  constructor(private skeleton: Segment, private width: number, private roundness = 0) {
    if (skeleton) {
      this.poly = this.generatePoly(width, roundness);
    }
  }

  static load(info: Envelope): Envelope {
    const env = new Envelope(null, info.width, info.roundness);
    env.skeleton = new Segment(info.skeleton.p1, info.skeleton.p2);
    env.poly = Polygon.load(info.poly);

    return env;
  }

  private generatePoly(width: number, roundness: number): Polygon {
    const { p1, p2 } = this.skeleton;
    const radius = width / 2;
    const alpha = angle(subtract(p1, p2));
    const alpha_cw = alpha + Math.PI / 2;
    const alpha_ccw = alpha - Math.PI / 2;
    const points = [];
    const step = Math.PI / Math.max(1, roundness);
    const eps = step / 2;
    for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
      points.push(translate(p1, i, radius));
    }
    for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
      points.push(translate(p2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }

  draw(ctx: CanvasRenderingContext2D, options: any = {}) {
    this.poly.draw(ctx, options);
  }
}
