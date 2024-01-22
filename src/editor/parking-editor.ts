import { World } from '@world/world';
import { Viewport } from './viewport';
import { Point } from '@world/primitives';
import { MarkingEditor } from './marking-editor';
import { Parking, Marking } from '@world/markings';

export class ParkingEditor extends MarkingEditor {
  constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  protected override createMarking(center: Point, directionVector: Point): Marking {
    return new Parking(center, directionVector, this.world.roadWidth / 2, this.world.roadWidth / 2);
  }
}
