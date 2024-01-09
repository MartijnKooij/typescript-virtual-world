import { add, scale, subtract } from '@world/math';
import { Point } from '@world/primitives';

export class Viewport {
  private ctx: CanvasRenderingContext2D;
  zoom = 1;
  center: Point = null;
  offset = new Point(0, 0);
  drag: ViewportDrag = {
    start: new Point(0, 0),
    end: new Point(0, 0),
    offset: new Point(0, 0),
    active: false
  };

  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = this.canvas.getContext('2d');
    this.center = new Point(this.canvas.width / 2, this.canvas.height / 2);
    this.offset = scale(this.center, -1);
    this.addEventListeners();
  }

  dispose() {
    this.removeEventListeners();
  }

  reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset();
    this.ctx.translate(offset.x, offset.y);
  }

  getMouse(evt: MouseEvent, subtractDragOffset = false) {
    const mouse = new Point(
      (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
      (evt.offsetY - this.center.y) * this.zoom - this.offset.y
    );
    return subtractDragOffset ? subtract(mouse, this.drag.offset) : mouse;
  }

  getOffset() {
    return add(this.offset, this.drag.offset);
  }

  private addEventListeners() {
    this.canvas.addEventListener('wheel', this.handleMouseWheel);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  }


  private removeEventListeners() {
    this.canvas.removeEventListener('wheel', this.handleMouseWheel);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (evt: MouseEvent) => {
    if (evt.button === 1) {
      this.drag.start = this.getMouse(evt);
      this.drag.active = true;
    }
  };

  private handleMouseMove = (evt: MouseEvent) => {
    if (this.drag.active) {
      this.drag.end = this.getMouse(evt);
      this.drag.offset = subtract(this.drag.end, this.drag.start);
    }
  };

  private handleMouseUp = (evt: MouseEvent) => {
    if (this.drag.active) {
      this.offset = add(this.offset, this.drag.offset);
      this.drag = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false
      };
    }
  };

  private handleMouseWheel = (evt: WheelEvent) => {
    const direction = Math.sign(evt.deltaY);
    const step = 0.1;
    this.zoom += direction * step;
    this.zoom = Math.max(1, Math.min(this.zoom, 5));
  };
}

export interface ViewportDrag {
  start: Point;
  end: Point;
  offset: Point;
  active: boolean;
}
