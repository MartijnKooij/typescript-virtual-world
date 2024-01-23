import { add, perpendicular, scale } from '@world/math';
import { Point, Segment } from '@world/primitives';
import { Marking } from './marking';

export class Crossing extends Marking {
  borders: Segment[];

  constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);
    this.borders = [this.poly.segments[0], this.poly.segments[2]];
    this.type = 'crossing';
  }

  override draw(ctx: CanvasRenderingContext2D) {
    const perpendicularLine = perpendicular(this.directionVector);
    const line = new Segment(
      add(this.center, scale(perpendicularLine, this.width / 2)),
      add(this.center, scale(perpendicularLine, -this.width / 2))
    );
    line.draw(ctx, { width: this.height, color: 'white', dash: [11, 11] });
  };
}
