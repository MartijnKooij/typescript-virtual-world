import { Point, Segment } from '@world/primitives';
import { Marking } from './marking';

export class Target extends Marking {
  state: 'green' | 'orange' | 'red';
  border: Segment;

  constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);
    this.type = 'target';
  }

  override draw(ctx: CanvasRenderingContext2D) {
    this.center.draw(ctx, { color: "red", size: 30 });
    this.center.draw(ctx, { color: "white", size: 20 });
    this.center.draw(ctx, { color: "red", size: 10 });
  }
}
