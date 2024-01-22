import { add, lerp2D, perpendicular, scale } from '@world/math';
import { Point, Segment } from '@world/primitives';
import { Marking } from './marking';

export class Light extends Marking {
  state: 'off' | 'green' | 'orange' | 'red';
  border: Segment;

  constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, 18);

    this.state = 'off';
    this.border = this.poly.segments[0];
  }

  override draw(ctx: CanvasRenderingContext2D) {
    const p = perpendicular(this.directionVector);
    const line = new Segment(
      add(this.center, scale(p, this.width / 2)),
      add(this.center, scale(p, -this.width / 2))
    );

    const green = lerp2D(line.p1, line.p2, 0.2);
    const orange = lerp2D(line.p1, line.p2, 0.5);
    const red = lerp2D(line.p1, line.p2, 0.8);

    new Segment(red, green).draw(ctx, {
      width: this.height,
      cap: 'round'
    });

    green.draw(ctx, { size: this.height * 0.6, color: '#060' });
    orange.draw(ctx, { size: this.height * 0.6, color: '#660' });
    red.draw(ctx, { size: this.height * 0.6, color: '#600' });

    switch (this.state) {
      case 'green':
        green.draw(ctx, { size: this.height * 0.6, color: '#0F0' });
        break;
      case 'orange':
        orange.draw(ctx, { size: this.height * 0.6, color: '#FF0' });
        break;
      case 'red':
        red.draw(ctx, { size: this.height * 0.6, color: '#F00' });
        break;
    }
  }
}
