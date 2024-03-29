import { Building, Tree } from './items';
import { Light, Marking, MarkingLoader } from './markings';
import { Graph, add, distance, getNearestPoint, lerp, scale } from './math';
import { Envelope, Point, Polygon, Segment } from './primitives';

export class World {
  private envelopes: Envelope[] = [];
  private roadBorders: Segment[] = [];
  private buildings: Building[] = [];
  private trees: Tree[] = [];
  private frameCount: number = 0;
  laneGuides: Segment[] = [];
  markings: any[] = [];
  zoom: number = 0;
  offset: Point = null;

  constructor(
    public graph: Graph,
    public roadWidth = 100,
    private roadRoundness = 10,
    private buildingWidth = 150,
    private buildingMinLength = 150,
    private spacing = 150,
    private treeSize = 160) {
    this.generate();
  }

  static load(info: World): World {
    const world = new World(new Graph());
    world.graph = Graph.load(info.graph);

    world.roadWidth = info.roadWidth;
    world.roadRoundness = info.roadRoundness;
    world.buildingWidth = info.buildingWidth;
    world.buildingMinLength = info.buildingMinLength;
    world.spacing = info.spacing;
    world.treeSize = info.treeSize;

    world.envelopes = info.envelopes.map(e => Envelope.load(e));
    world.roadBorders = info.roadBorders.map(b => new Segment(b.p1, b.p2));
    world.buildings = info.buildings.map(b => Building.load(b));
    world.trees = info.trees.map(t => Tree.load(t));
    world.laneGuides = info.laneGuides.map(l => new Segment(l.p1, l.p2));
    world.markings = info.markings.map(m => MarkingLoader.load(m));

    world.zoom = info.zoom;
    world.offset = new Point(info.offset.x, info.offset.y);

    return world;
  }

  dispose() {
    this.markings.length = 0;
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
    this.laneGuides.length = 0;
    this.laneGuides.push(...this.generateLaneGuides());
  }

  private generateLaneGuides() {
    const tmpEnvelopes: Envelope[] = [];
    for (const seg of this.graph.segments) {
      tmpEnvelopes.push(
        new Envelope(
          seg,
          this.roadWidth / 2,
          this.roadRoundness
        )
      );
    }
    const segments = Polygon.union(tmpEnvelopes.map(e => e.poly));

    return segments;
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

    return bases.map(b => new Building(b));
  }

  private generateTrees(count: number = 10) {
    const points = [
      ...this.roadBorders.map(r => [r.p1, r.p2]).flat(),
      ...this.buildings.map(b => b.base.points).flat()
    ];
    const left = Math.min(...points.map(p => p.x));
    const right = Math.max(...points.map(p => p.x));
    const top = Math.min(...points.map(p => p.y));
    const bottom = Math.max(...points.map(p => p.y));

    const illegalPolygons = [
      ...this.buildings.map(b => b.base),
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
        keep = trees.every(tree => distance(tree.center, p) >= this.treeSize);
      }

      // Too far away from anything
      if (keep) {
        keep = illegalPolygons.some(poly => poly.distanceToPoint(p) < this.treeSize * 2);
      }

      if (keep) {
        trees.push(new Tree(p, this.treeSize));
        tryCount = 0;
      }
      tryCount++;
    }

    return trees;
  }

  private getIntersections() {
    const subset = [];
    for (const point of this.graph.points) {
      let degree = 0;
      for (const seg of this.graph.segments) {
        if (seg.includes(point)) {
          degree++;
        }
      }

      if (degree > 2) {
        subset.push(point);
      }
    }
    return subset;
  }

  private updateLights() {
    const lights = this.markings.filter((m) => m instanceof Light);
    const controlCenters: Map<Point, { ticks: number, lights: Light[] }> = new Map();
    for (const light of lights) {
      const point = getNearestPoint(light.center, this.getIntersections());
      if (!controlCenters.has(point)) {
        controlCenters.set(new Point(point.x, point.y), { ticks: 0, lights: [light] });
      } else {
        const controlCenter = controlCenters.get(point);
        controlCenter.lights.push(light);
      }
    }
    const greenDuration = 2,
      orangeDuration = 1;
    for (const center of controlCenters.entries()) {
      center[1].ticks = center[1].lights.length * (greenDuration + orangeDuration);
    }
    const tick = Math.floor(this.frameCount / 60);
    for (const center of controlCenters) {
      const cTick = tick % center[1].ticks;
      const isGreenOrOrange = cTick != 0;
      const greenOrangeState =
        cTick % (greenDuration + orangeDuration) < greenDuration
          ? 'green'
          : 'orange';
      for (let i = 0; i < center[1].lights.length; i++) {
        if (isGreenOrOrange) {
          center[1].lights[i].state = greenOrangeState;
        } else {
          center[1].lights[i].state = 'red';
        }
      }
    }
    this.frameCount++;
  }

  draw(ctx: CanvasRenderingContext2D, viewPoint: Point) {
    this.updateLights();

    for (const env of this.envelopes) {
      env.draw(ctx, { fill: '#BBB', stroke: '#BBB', lineWidth: 15 });
    }
    for (const marking of this.markings) {
      marking.draw(ctx);
    }
    for (const seg of this.graph.segments) {
      seg.draw(ctx, { color: 'white', width: 4, dash: [10, 10] });
    }
    for (const border of this.roadBorders) {
      border.draw(ctx, { color: 'white', width: 4 });
    }

    const items = [...this.buildings, ...this.trees];
    items.sort((a, b) => b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint));
    for (const item of items) {
      item.draw(ctx, viewPoint);
    }
  }
}
