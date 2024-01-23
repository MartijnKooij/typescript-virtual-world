import { angle } from '@world/math';
import { Point, Segment } from '@world/primitives';
import { Marking } from './marking';

export class Parking extends Marking {
  borders: Segment[];

  constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);
    this.borders = [this.poly.segments[0], this.poly.segments[2]];
    this.type = 'parking';
  }

  override draw(ctx: CanvasRenderingContext2D) {
    for (const border of this.borders) {
      border.draw(ctx, { width: 5, color: "white" });
    }
    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(angle(this.directionVector));

    ctx.beginPath();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold " + this.height * 0.9 + "px Arial";
    ctx.fillText("P", 0, 3);

    ctx.restore();
  }
}
