import { average, getIntersection, getRandomColor } from '@world/math';
import { Point } from './point';
import { Segment } from './segment';

export class Polygon {
  segments: Segment[] = [];

  constructor(public points: Point[]) {
    for (let i = 1; i <= points.length; i++) {
      this.segments.push(new Segment(points[i - 1], points[i % points.length]));
    }
  }

  static union(polygons: Polygon[]) {
    Polygon.multiBreak(polygons);
    const keptSegments = [];
    for (let i = 0; i < polygons.length; i++) {
      for (const seg of polygons[i].segments) {
        let keep = true;
        for (let j = 0; j < polygons.length; j++) {
          if (i != j) {
            if (polygons[j].containsSegment(seg)) {
              keep = false;
              break;
            }
          }
        }
        if (keep) {
          keptSegments.push(seg);
        }
      }
    }
    return keptSegments;
  }

  static multiBreak(polygons: Polygon[]) {
    for (let i = 0; i < polygons.length - 1; i++) {
      for (let j = i + 1; j < polygons.length; j++) {
        Polygon.break(polygons[i], polygons[j]);
      }
    }
  }

  static break(p1: Polygon, p2: Polygon) {
    const s1 = p1.segments;
    const s2 = p2.segments;
    for (let i = 0; i < s1.length; i++) {
      for (let j = 0; j < s2.length; j++) {
        const intersection = getIntersection(s1[i].p1, s1[i].p2, s2[j].p1, s2[j].p2);

        if (intersection && intersection.offset != 1 && intersection.offset != 0) {
          const point = new Point(intersection.x, intersection.y);
          let aux = s1[i].p2;
          s1[i].p2 = point;
          s1.splice(i + 1, 0, new Segment(point, aux));
          aux = s2[j].p2;
          s2[j].p2 = point;
          s2.splice(j + 1, 0, new Segment(point, aux));

        }
      }
    }
  }

  intersectsPoly(poly: Polygon) {
    for (let s1 of this.segments) {
      for (let s2 of poly.segments) {
        if (getIntersection(s1.p1, s1.p2, s2.p1, s2.p2)) {
          return true;
        }
      }
    }
    return false;
  }

  distanceToPoly(poly: Polygon) {
    return Math.min(...this.points.map(p => poly.distanceToPoint(p)));
  }

  distanceToPoint(p: Point) {
    return Math.min(...this.segments.map(s => s.distanceToPoint(p)));
  }

  containsSegment(seg: Segment) {
    const midpoint = average(seg.p1, seg.p2)
    return this.containsPoint(midpoint);
  }

  containsPoint(point: Point) {
    const outerPoint = new Point(-1000, -1000);
    let intersectionCount = 0;
    for (const seg of this.segments) {
      const int = getIntersection(outerPoint, point, seg.p1, seg.p2);
      if (int) {
        intersectionCount++;
      }
    }
    return intersectionCount % 2 === 1;
  }

  drawSegments(ctx: CanvasRenderingContext2D) {
    this.segments.forEach(s => {
      s.draw(ctx, { color: getRandomColor(), width: 5 });
    })
  }

  draw(ctx: CanvasRenderingContext2D, { stroke = 'blue', lineWidth = 2, fill = 'rgba(0,0,255,0.3', join = 'miter' } = {}) {
    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = join as CanvasLineJoin;
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let p = 1; p < this.points.length; p++) {
      ctx.lineTo(this.points[p].x, this.points[p].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
