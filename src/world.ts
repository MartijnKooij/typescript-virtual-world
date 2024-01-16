import { Graph, add, distance, lerp, scale } from './math';
import { Envelope, Point, Polygon, Segment } from './primitives';

export class World {
  private envelopes: Envelope[] = [];
  private roadBorders: Segment[] = [];
  private buildings: Polygon[] = [];
  private trees: Point[] = [];

  constructor(
    public graph: Graph,
    private roadWidth = 100,
    private roadRoundness = 10,
    private buildingWidth = 150,
    private buildingMinLength = 150,
    private spacing = 50,
    private treeSize = 160) {
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
    this.trees = this.generateTrees();
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

    const eps = 0.001;
    for (let i = 0; i < bases.length; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (bases[i].intersectsPoly(bases[j]) || bases[i].distanceToPoly(bases[j]) < this.spacing - eps) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases;
  }

  private generateTrees(count: number = 10) {
    const points = [
      ...this.roadBorders.map(r => [r.p1, r.p2]).flat(),
      ...this.buildings.map(b => b.points).flat()
    ];
    const left = Math.min(...points.map(p => p.x));
    const right = Math.max(...points.map(p => p.x));
    const top = Math.min(...points.map(p => p.y));
    const bottom = Math.max(...points.map(p => p.y));

    const illegalPolygons = [
      ...this.buildings,
      ...this.envelopes.map(e => e.poly)
    ];

    const trees = [];
    let tryCount = 0;
    while (tryCount < 100) {
      const p = new Point(
        lerp(left, right, Math.random()),
        lerp(bottom, top, Math.random())
      );

      // Too close to buildings
      let keep = !illegalPolygons.some(poly => poly.containsPoint(p) || poly.distanceToPoint(p) < this.treeSize / 2);

      // Too close to other trees
      if (keep) {
        keep = trees.every(tree => distance(tree, p) >= this.treeSize);
      }

      // Too far away from anything
      if (keep) {
        keep = illegalPolygons.some(poly => poly.distanceToPoint(p) < this.treeSize * 2);
      }

      if (keep) {
        trees.push(p);
        tryCount = 0;
      }
      tryCount++;
    }

    return trees;
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
    for (const tree of this.trees) {
      tree.draw(ctx, { size: this.treeSize, color: 'rgba(0, 0, 0, 0.5)' });
    }
    for (const building of this.buildings) {
      building.draw(ctx);
    }
  }
}
