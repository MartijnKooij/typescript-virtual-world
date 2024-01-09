import { GraphEditor, Viewport } from './editor';
import { Graph } from './math';
import { Point, Segment } from './primitives';

class App {
  private canvas: HTMLCanvasElement;
  private graphEditor: GraphEditor;
  private viewport: Viewport;
  private graph: Graph;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.getElementById('worldCanvas') as HTMLCanvasElement;
    this.canvas.width = 600;
    this.canvas.height = 500;

    this.ctx = this.canvas.getContext('2d');

    const graphData = localStorage.getItem('graph');
    const graphInfo = graphData ? JSON.parse(graphData) : null;
    this.graph = graphInfo ? Graph.load(graphInfo) : new Graph();
    this.viewport = new Viewport(this.canvas);
    this.graphEditor = new GraphEditor(this.viewport, this.graph);

    this.animate();
  }

  animate() {
    this.viewport.reset();
    this.graphEditor.display();
    requestAnimationFrame(() => this.animate());
  }

  save() {
    localStorage.setItem('graph', JSON.stringify(this.graph));
  }

  clear() {
    this.graphEditor.dispose();
  }
}

const app = new App();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#save').addEventListener('click', () => app.save());
  document.querySelector('#clear').addEventListener('click', () => app.clear());
});
