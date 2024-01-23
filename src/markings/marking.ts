import { angle, translate } from '@world/math';
import { Envelope, Point, Polygon, Segment } from '@world/primitives';

export abstract class Marking {
  private support: Segment;

  poly: Polygon;
  type: 'unknown' | 'crossing' | 'light' | 'parking' | 'start' | 'stop-sign' | 'target' | 'yield' = 'unknown';

  constructor(public center: Point, public directionVector: Point, public width: number, public height: number) {
    this.support = new Segment(
      translate(this.center, angle(this.directionVector), this.height / 2),
      translate(this.center, angle(this.directionVector), -this.height / 2)
    );
    this.poly = new Envelope(this.support, this.width, 0).poly;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}
