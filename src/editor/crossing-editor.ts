import { World } from '@world/world';
import { Viewport } from './viewport';
import { MarkingEditor } from './marking-editor';
import { Marking } from '@world/markings/marking';
import { Point } from '@world/primitives';
import { Crossing } from '@world/markings/crossing';

export class CrossingEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.graph.segments);
  }

  protected override createMarking(center: Point, directionVector: Point): Marking {
    return new Crossing(center, directionVector, this.world.roadWidth, this.world.roadWidth / 2);
  }
}
