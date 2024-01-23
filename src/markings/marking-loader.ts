import { Point } from '@world/primitives';
import { Crossing } from './crossing';
import { Light } from './light';
import { Marking } from './marking';
import { Parking } from './parking';
import { Start } from './start';
import { StopSign } from './stop-sign';
import { Target } from './target';
import { Yield } from './yield';

export class MarkingLoader {
  static load(info: Marking): Marking {
    const center = new Point(info.center.x, info.center.y);
    const directionVector = new Point(info.directionVector.x, info.directionVector.y);
    switch (info.type) {
      case 'crossing':
        return new Crossing(center, directionVector, info.width, info.height);
      case 'light':
        return new Light(center, directionVector, info.width, info.height);
      case 'parking':
        return new Parking(center, directionVector, info.width, info.height);
      case 'start':
        return new Start(center, directionVector, info.width, info.height);
      case 'stop-sign':
        return new StopSign(center, directionVector, info.width, info.height);
      case 'target':
        return new Target(center, directionVector, info.width, info.height);
      case 'yield':
        return new Yield(center, directionVector, info.width, info.height);
      default:
        break;
    }
  }
}
