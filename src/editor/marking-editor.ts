import { World } from '@world/world';
import { Viewport } from './viewport';
import { Point, Segment } from '@world/primitives';
import { getNearestSegment } from '@world/math';
import { Marking } from '@world/markings/marking';

export abstract class MarkingEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mouse: Point = null;
  private intent: Marking = null;
  private markings: Marking[] = [];

  constructor(protected viewport: Viewport, protected world: World, protected targetSegments: Segment[]) {
    this.canvas = this.viewport.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.markings = this.world.markings;
  }

  set enabled(value: boolean) {
    if (value) {
      this.addEventListeners();
    } else {
      this.removeEventListeners();
    }
  }

  display() {
    if (this.intent) {
      this.intent.draw(this.ctx);
    }
  }

  dispose() {
    this.markings.length = 0;
    this.intent = null;
  }

  protected abstract createMarking(center: Point, directionVector: Point): Marking;

  private addEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
  }

  private removeEventListeners() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
  }

  private handleMouseDown = (evt: MouseEvent) => {
    if (evt.button === 0) {
      if (this.intent) {
        this.markings.push(this.intent);
        this.intent = null;
      }
    }
    if (evt.button === 2) {
      for (let i = 0; i < this.markings.length; i++) {
        const poly = this.markings[i].poly;
        if (poly.containsPoint(this.mouse)) {
          this.markings.splice(i, 1);
          return;
        }
      }
    }
  };

  private handleMouseMove = (evt: MouseEvent) => {
    this.mouse = this.viewport.getMouse(evt, true);
    const segment = getNearestSegment(this.mouse, this.targetSegments, 10 * this.viewport.zoom);

    if (segment) {
      const projection = segment.projectPoint(this.mouse);
      if (projection.offset >= 0 && projection.offset <= 1) {
        this.intent = this.createMarking(projection.point, segment.directionVector());
      } else {
        this.intent = null;
      }
    } else {
      this.intent = null;
    }
  };

  private handleContextMenu = (evt: Event) => evt.preventDefault();
}
