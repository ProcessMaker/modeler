import { dummyShape } from '../../../utilities/dummies';
import toHaveBeenProgrammaticallyMoved from '../../../customMatchers/toHaveBeenProgrammaticallyMoved';
import toHaveBeenProgrammaticallyMovedBy from '../../../customMatchers/toHaveBeenProgrammaticallyMovedBy';
import {
  alignBottom,
  alignLeft,
  alignRight,
  alignTop,
  centerHorizontally,
  centerVertically,
} from '@/components/nodes/utilities/align';

/**
 * This is just to make sure that the IDE doesn't bug me about the extensions
 * made to the jest matcher.
 * @type {Function}
 */
const expect = require('expect');
expect.extend({ toHaveBeenProgrammaticallyMoved, toHaveBeenProgrammaticallyMovedBy });

describe('Shape Alignment', () => {
  it('can align left', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    alignLeft(shapes);

    expect(shapes[0]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[1]).toHaveBeenProgrammaticallyMovedBy(-100, 0);
    expect(shapes[2]).toHaveBeenProgrammaticallyMovedBy(-200, 0);
  });

  it('can align right', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    alignRight(shapes);

    expect(shapes[0]).toHaveBeenProgrammaticallyMovedBy(200, 0);
    expect(shapes[1]).toHaveBeenProgrammaticallyMovedBy(100, 0);
    expect(shapes[2]).not.toHaveBeenProgrammaticallyMoved();
  });

  it('can align top', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    alignTop(shapes);

    expect(shapes[0]).not.toHaveBeenProgrammaticallyMoved(0, 0);
    expect(shapes[1]).toHaveBeenProgrammaticallyMovedBy(0, -100);
    expect(shapes[2]).toHaveBeenProgrammaticallyMovedBy(0, -200);
  });

  it('can align bottom', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    alignBottom(shapes);

    expect(shapes[0]).toHaveBeenProgrammaticallyMovedBy(0, 200);
    expect(shapes[1]).toHaveBeenProgrammaticallyMovedBy(0, 100);
    expect(shapes[2]).not.toHaveBeenProgrammaticallyMoved();
  });

  it('can center X', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    centerHorizontally(shapes);

    expect(shapes[0]).toHaveBeenProgrammaticallyMovedBy(100, 0);
    expect(shapes[1]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[2]).toHaveBeenProgrammaticallyMovedBy(-100, 0);
  });

  it('can center Y', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    centerVertically(shapes);

    expect(shapes[0]).toHaveBeenProgrammaticallyMovedBy(0, 100);
    expect(shapes[1]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[2]).toHaveBeenProgrammaticallyMovedBy(0, -100);
  });
});

