import { Graph, add, scale } from './math';
import { Envelope, Point, Polygon, Segment } from './primitives';

export class World {
  private envelopes: Envelope[] = [];
  private roadBorders: Segment[] = [];
  private buildings: Polygon[] = [];

  constructor(public graph: Graph, private roadWidth = 100, private roadRoundness = 10, private buildingWidth = 150, private buildingMinLength = 150, private spacing = 50) {
    this.generate();
  }

  generate() {
    this.envelopes.length = 0;
    for (const seg of this.graph.segments) {
      this.envelopes.push(
        new Envelope(seg, this.roadWidth, this.roadRoundness)
      );
    }

    this.roadBorders = Polygon.union(this.envelopes.map(e => e.poly));
    this.buildings = this.generateBuildings();
  }

  private generateBuildings() {
    const tmpEnvelopes: Envelope[] = [];
    for (const seg of this.graph.segments) {
      tmpEnvelopes.push(
        new Envelope(
          seg,
          this.roadWidth + this.buildingWidth + this.spacing * 2,
          this.roadRoundness
        )
      );
    }

    const guides = Polygon
      .union(tmpEnvelopes.map(e => e.poly))
      .filter(seg => seg.length() >= this.buildingMinLength);

    const supports = [];
    for (let guide of guides) {
      const len = guide.length() + this.spacing;
      const buildingCount = Math.floor(len / (this.buildingMinLength + this.spacing));
      const buildingLength = len / buildingCount - this.spacing;

      const dir = guide.directionVector();

      let q1 = guide.p1;
      let q2 = add(q1, scale(dir, buildingLength));
      supports.push(new Segment(q1, q2));

      for (let b = 2; b <= buildingCount; b++) {
        q1 = add(q2, scale(dir, this.spacing));
        q2 = add(q1, scale(dir, buildingLength));
        supports.push(new Segment(q1, q2));
      }
    }

    const bases = [];
    for (const support of supports) {
      bases.push(new Envelope(support, this.buildingWidth).poly);
    }

    for (let i = 0; i < bases.length; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (bases[i].intersectsPoly(bases[j])) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const env of this.envelopes) {
      env.draw(ctx, { fill: '#BBB', stroke: '#BBB', lineWidth: 15 });
    }
    for (const seg of this.graph.segments) {
      seg.draw(ctx, { color: 'white', width: 4, dash: [10, 10] });
    }
    for (const border of this.roadBorders) {
      border.draw(ctx, { color: 'white', width: 4 });
    }
    for (const building of this.buildings) {
      building.draw(ctx);
    }
  }
}
