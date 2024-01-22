import { World } from '@world/world';
import { Viewport } from './viewport';
import { MarkingEditor } from './marking-editor';
import { Point } from '@world/primitives';
import { Marking, Crossing } from '@world/markings';

export class CrossingEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.graph.segments);
  }

  protected override createMarking(center: Point, directionVector: Point): Marking {
    return new Crossing(center, directionVector, this.world.roadWidth, this.world.roadWidth / 2);
  }
}
