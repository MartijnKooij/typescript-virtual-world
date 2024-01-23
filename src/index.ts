import { CrossingEditor, GraphEditor, LightEditor, MarkingEditor, ParkingEditor, StartEditor, StopSignEditor, TargetEditor, Viewport, YieldEditor } from './editor';
import { Graph, scale } from './math';
import { World } from './world';

class App {
  private canvas: HTMLCanvasElement;
  private tools: Map<string, MarkingEditor | GraphEditor> = new Map();
  private viewport: Viewport;
  private world: World;
  private graph: Graph;
  private graphHash: string;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.getElementById('worldCanvas') as HTMLCanvasElement;
    this.canvas.width = 1600;
    this.canvas.height = 500;

    this.ctx = this.canvas.getContext('2d');

    const worldData = localStorage.getItem('world');
    const worldInfo = worldData ? JSON.parse(worldData) : null;
    this.world = worldInfo ? World.load(worldInfo) : new World(new Graph());
    this.graph = this.world.graph;

    this.viewport = new Viewport(this.canvas, this.world.zoom, this.world.offset);
    this.tools.set('graphEditor', new GraphEditor(this.viewport, this.graph));
    this.tools.set('stopSignEditor', new StopSignEditor(this.viewport, this.world));
    this.tools.set('crossingEditor', new CrossingEditor(this.viewport, this.world));
    this.tools.set('startEditor', new StartEditor(this.viewport, this.world));
    this.tools.set('targetEditor', new TargetEditor(this.viewport, this.world));
    this.tools.set('yieldEditor', new YieldEditor(this.viewport, this.world));
    this.tools.set('parkingEditor', new ParkingEditor(this.viewport, this.world));
    this.tools.set('lightEditor', new LightEditor(this.viewport, this.world));

    this.graphHash = this.graph.hash();

    this.setMode('graphEditor');
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
    this.tools.forEach(tool => {
      tool.display();
    });
    requestAnimationFrame(() => this.animate());
  }

  save() {
    this.world.zoom = this.viewport.zoom;
    this.world.offset = this.viewport.offset;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.world)));
    element.setAttribute('download', 'wy.world');
    element.click();
    localStorage.setItem('world', JSON.stringify(this.world));
  }

  load(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];

    if (!file) {
      alert('No file selected');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const fileContents = evt.target.result as string;
      const worldData = JSON.parse(JSON.stringify(fileContents));
      const worldInfo = worldData ? JSON.parse(worldData) : null;
      this.world = worldInfo ? World.load(worldInfo) : new World(new Graph());
      localStorage.setItem('world', JSON.stringify(this.world));
      window.location.reload();
    }
    reader.readAsText(file);
  }

  clear() {
    this.tools.forEach(tool => {
      tool.dispose();
    });
    this.world.dispose();
  }

  setMode(mode: string) {
    this.disableEditors();

    const button = document.querySelector('#' + mode) as HTMLButtonElement;
    button.style.backgroundColor = 'white';
    button.style.filter = '';

    this.tools.forEach((tool, key) => {
      tool.enabled = mode === key;
    });
  }

  private disableEditors() {
    this.tools.forEach((_, key) => {
      const button = document.querySelector(`#${key}`) as HTMLButtonElement;
      button.style.backgroundColor = 'gray';
      button.style.filter = 'grayscale(100%)';
    });
  }
}

const app = new App();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#save').addEventListener('click', () => app.save());
  document.querySelector('#clear').addEventListener('click', () => app.clear());
  document.querySelector('#graphEditor').addEventListener('click', () => app.setMode('graphEditor'));
  document.querySelector('#stopSignEditor').addEventListener('click', () => app.setMode('stopSignEditor'));
  document.querySelector('#crossingEditor').addEventListener('click', () => app.setMode('crossingEditor'));
  document.querySelector('#startEditor').addEventListener('click', () => app.setMode('startEditor'));
  document.querySelector('#targetEditor').addEventListener('click', () => app.setMode('targetEditor'));
  document.querySelector('#yieldEditor').addEventListener('click', () => app.setMode('yieldEditor'));
  document.querySelector('#parkingEditor').addEventListener('click', () => app.setMode('parkingEditor'));
  document.querySelector('#lightEditor').addEventListener('click', () => app.setMode('lightEditor'));
  document.querySelector('#fileInput').addEventListener('change', (event) => app.load(event));
});


