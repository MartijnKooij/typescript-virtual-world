import { GraphEditor, Viewport } from './editor';
import { Graph, scale } from './math';
import { Envelope } from './primitives';
import { World } from './world';

class App {
  private canvas: HTMLCanvasElement;
  private graphEditor: GraphEditor;
  private viewport: Viewport;
  private world: World;
  private graph: Graph;
  private graphHash: string;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.getElementById('worldCanvas') as HTMLCanvasElement;
    this.canvas.width = 600;
    this.canvas.height = 500;

    this.ctx = this.canvas.getContext('2d');

    const graphData = localStorage.getItem('graph');
    const graphInfo = graphData ? JSON.parse(graphData) : null;
    this.graph = graphInfo ? Graph.load(graphInfo) : new Graph();
    this.world = new World(this.graph);
    this.viewport = new Viewport(this.canvas);
    this.graphEditor = new GraphEditor(this.viewport, this.graph);

    this.graphHash = this.graph.hash();
    this.animate();
  }

  animate() {
    this.viewport.reset();
    if (this.graphHash != this.graph.hash()) {
      this.world.generate();
      this.graphHash = this.graph.hash();
    }
    const viewPoint = scale(this.viewport.getOffset(), -1);
    this.world.draw(this.ctx, viewPoint);
    this.ctx.globalAlpha = 0.3;
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
