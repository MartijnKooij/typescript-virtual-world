import { Point, Segment } from '@world/primitives';

export class Graph {
  constructor(public points: Point[] = [], public segments: Segment[] = []) { }

  static load({ points = Array.of<Point>(), segments = Array.of<Segment>() }) {
    const graphPoints = points.map(p => new Point(p.x, p.y));
    return new Graph(graphPoints, segments.map(s => new Segment(
      graphPoints.find(p => p.equals(s.p1)),
      graphPoints.find(p => p.equals(s.p2)))));
  }

  addPoint(point: Point) {
    this.points.push(point);
  }

  containsPoint(point: Point) {
    return this.points.find(p => p.equals(point));
  }

  tryAddPoint(point: Point) {
    if (!this.containsPoint(point)) {
      this.addPoint(point);
      return true;
    }
    return false;
  }

  removePoint(point: Point) {
    this.points.splice(this.points.indexOf(point), 1);
    const segments = this.getSegmentsWithPoint(point);
    segments.forEach(s => this.removeSegment(s));
  }

  addSegment(segment: Segment) {
    this.segments.push(segment);
  }

  containsSegment(segment: Segment) {
    return this.segments.find(s => s.equals(segment));
  }

  tryAddSegment(segment: Segment) {
    if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
      this.addSegment(segment);
      return true;
    }
    return false;
  }

  removeSegment(segment: Segment) {
    this.segments.splice(this.segments.indexOf(segment), 1);
  }

  getSegmentsWithPoint(point: Point) {
    return this.segments.filter(s => s.includes(point))
  }

  dispose() {
    this.segments.length = 0;
    this.points.length = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const seg of this.segments) {
      seg.draw(ctx);
    }
    for (const point of this.points) {
      point.draw(ctx);
    }
  }
}
