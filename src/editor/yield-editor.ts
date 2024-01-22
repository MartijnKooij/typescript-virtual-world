import { World } from '@world/world';
import { Viewport } from './viewport';
import { Point } from '@world/primitives';
import { MarkingEditor } from './marking-editor';
import { Yield, Marking } from '@world/markings';

export class YieldEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  protected override createMarking(center: Point, directionVector: Point): Marking {
    return new Yield(center, directionVector, this.world.roadWidth / 2, this.world.roadWidth / 2);
  }
}
