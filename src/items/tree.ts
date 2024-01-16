import { add, lerp, lerp2D, scale, subtract, translate } from '@world/math';
import { Point, Polygon } from '@world/primitives';

export class Tree {
  base: Polygon;

  constructor(public center: Point, private size: number, private heightCoefficient: number = 0.3) {
    this.base = this.generateLevel(this.center, this.size);
  }

  draw(ctx: CanvasRenderingContext2D, viewPoint: Point) {
    const diff = subtract(this.center, viewPoint)
    const top = add(this.center, scale(diff, this.heightCoefficient));

    const levelCount = 7;
    for (let level = 0; level < levelCount; level++) {
      const t = level / (levelCount - 1);
      const point = lerp2D(this.center, top, t);
      const color = `rgb(30, ${lerp(50, 200, t)}, 70)`;
      const size = lerp(this.size, 40, t);
      const poly = this.generateLevel(point, size);
      poly.draw(ctx, { fill: color, stroke: 'rgba(0,0,0,0)' });
    }
  }

  private generateLevel(point: Point, size: number) {
    const points = [];
    const rad = size / 2;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
      const pseudoRandom = Math.cos(((a + this.center.x) * size) % 17) ** 2;
      const noisyRadius = rad * lerp(0.5, 1, pseudoRandom);
      points.push(translate(point, a, noisyRadius));
    }

    return new Polygon(points);
  }
}
