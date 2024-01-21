import { angle } from '@world/math';
import { Point, Segment } from '@world/primitives';
import { Marking } from './marking';

export class StopSign extends Marking {
  border: Segment;

  constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);
    this.border = this.poly.segments[2];
  }

  override draw(ctx: CanvasRenderingContext2D) {
    this.border.draw(ctx, { color: 'white', width: 5 });

    ctx.save();
    ctx.translate(this.center.x, this.center.y);
    ctx.rotate(angle(this.directionVector) - Math.PI / 2);
    ctx.scale(1, 3);

    ctx.beginPath();
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = 'bold ' + this.height * 0.3 + 'px Arial';
    ctx.fillText('STOP', 0, 1);

    ctx.restore();
  }
}
