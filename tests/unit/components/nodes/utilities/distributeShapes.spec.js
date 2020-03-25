import {
  distributeHorizontalSpacingEvenly,
  distributeVerticalCentersEvenly,
} from '@/components/nodes/utilities/distribute';
import { dummyShape } from '../../../utilities/dummies';
import toHaveBeenProgrammaticallyMoved from '../../../customMatchers/toHaveBeenProgrammaticallyMoved';
import toHaveBeenProgrammaticallyMovedBy from '../../../customMatchers/toHaveBeenProgrammaticallyMovedBy';

/**
 * @type {Function}
 */
const expect = require('expect');
expect.extend({ toHaveBeenProgrammaticallyMoved, toHaveBeenProgrammaticallyMovedBy });

describe('Shape Distribution', () => {
  it('can distribute vertical spacing', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 50, 100, 50),
      dummyShape(100, 100, 100, 100),
      dummyShape(200, 750, 100, 50),
    ];

    distributeVerticalCentersEvenly(shapes);

    expect(shapes[0]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[1]).toHaveBeenProgrammaticallyMovedBy(0, 200);
    expect(shapes[2]).toHaveBeenProgrammaticallyMovedBy(0, 375);
    expect(shapes[3]).not.toHaveBeenProgrammaticallyMoved();
  });

  it('only distributes three or more items', () => {
    // two items are evenly distributed by definition
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(200, 600, 100, 50),
    ];

    distributeVerticalCentersEvenly(shapes);
    distributeHorizontalSpacingEvenly(shapes);

    expect(shapes[0]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[1]).not.toHaveBeenProgrammaticallyMoved();
  });

  it('can distribute horizontal spacing', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 0, 50, 50),
      dummyShape(150, 0, 100, 50),
      dummyShape(400, 0, 100, 50),
    ];

    distributeHorizontalSpacingEvenly(shapes);

    expect(shapes[0]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[1]).toHaveBeenProgrammaticallyMovedBy(50, 0);
    expect(shapes[2]).toHaveBeenProgrammaticallyMovedBy(100, 0);
    expect(shapes[3]).not.toHaveBeenProgrammaticallyMoved();
  });
});

