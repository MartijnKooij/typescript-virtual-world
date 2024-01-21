import { Point, Segment } from '@world/primitives';
import { Graph, getNearestPoint } from '@world/math';
import { Viewport } from './viewport';

export class GraphEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private selected: Point = null;
  private hovered: Point = null;
  private mouse: Point = null;
  private dragging = false;

  set enabled(value: boolean) {
    if (value) {
      this.addEventListeners();
    } else {
      this.removeEventListeners();
      this.selected = null;
      this.hovered = null;
    }
  }

  constructor(private viewport: Viewport, public graph: Graph) {
    this.canvas = this.viewport.canvas;
    this.ctx = this.canvas.getContext('2d');
  }

  dispose() {
    this.graph.dispose();
    this.selected = null;
    this.hovered = null;
  }

  display() {
    this.graph.draw(this.ctx);
    if (this.selected) {
      const intent = this.hovered ? this.hovered : this.mouse;
      new Segment(this.selected, intent).draw(this.ctx, { dash: [3, 3] });
      this.selected.draw(this.ctx, { outline: true });
    }
    if (this.hovered) {
      this.hovered.draw(this.ctx, { fill: true });
    }
  }

  private addEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  private removeEventListeners() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (evt: MouseEvent) => {
    if (evt.button === 2) {
      if (this.selected) {
        this.selected = null;
      } else if (this.hovered) {
        this.removePoint(this.hovered);
      }
    }
    if (evt.button === 0) {
      if (this.hovered) {
        this.selectPoint(this.hovered);
        this.dragging = true;
        return;
      }
      this.graph.addPoint(this.mouse);
      this.selectPoint(this.mouse);
      this.hovered = this.mouse;
    }
  };

  private handleMouseMove = (evt: MouseEvent) => {
    this.mouse = this.viewport.getMouse(evt, true);
    this.hovered = getNearestPoint(this.mouse, this.graph.points, 10 * this.viewport.zoom);
    if (this.dragging) {
      this.selected.x = this.mouse.x;
      this.selected.y = this.mouse.y;
    }
  };

  private handleContextMenu = (evt: Event) => evt.preventDefault();
  private handleMouseUp = () => this.dragging = false;

  private selectPoint(point: Point) {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }
    this.selected = point;
  }

  private removePoint(point: Point) {
    this.graph.removePoint(point);
    this.hovered = null;
    if (this.selected == point) {
      this.selected = null;
    }
  }
}
