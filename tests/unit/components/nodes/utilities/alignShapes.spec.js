import {
  alignBottom,
  alignLeft,
  alignRight,
  alignTop,
  centerX,
  centerY,
  distributeVerticalCentersEvenly,
  getBoundingBox,
} from '@/components/nodes/utilities/AlignShapes';
import { dummyShape } from '../../../utilities/dummies';
import index from '../../../customMatchers/toHaveBeenProgrammaticallyMoved';
import toHaveBeenProgrammaticallyMovedBy from '../../../customMatchers/toHaveBeenProgrammaticallyMovedBy';

/**
 * @type {Function}
 */
const expect = require('expect');
expect.extend({ toHaveBeenProgrammaticallyMoved, toHaveBeenProgrammaticallyMovedBy });

describe('Shape Alignment', () => {
  it('can calculate a correct bounding box with one shape', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
    ];

    const bounds = getBoundingBox(shapes);

    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(0);
    expect(bounds.bottom).toBe(50);
    expect(bounds.right).toBe(100);
    expect(bounds.width).toBe(100);
    expect(bounds.height).toBe(50);
    expect(bounds.vMiddle).toBe(25);
    expect(bounds.hMiddle).toBe(50);
  });

  it('can calculate a correct bounding box with multiple shapes', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    const bounds = getBoundingBox(shapes);
    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(0);
    expect(bounds.bottom).toBe(250);
    expect(bounds.right).toBe(300);
    expect(bounds.width).toBe(300);
    expect(bounds.height).toBe(250);
    expect(bounds.vMiddle).toBe(125);
    expect(bounds.hMiddle).toBe(150);
  });

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

    centerX(shapes);

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

    centerY(shapes);

    expect(shapes[0]).toHaveBeenProgrammaticallyMovedBy(0, 100);
    expect(shapes[1]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[2]).toHaveBeenProgrammaticallyMovedBy(0, -100);
  });

  it('can distribute Y middles', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 50, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 600, 100, 50),
    ];

    distributeVerticalCentersEvenly(shapes);

    expect(shapes[0]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[1]).toHaveBeenProgrammaticallyMovedBy(0, 150);
    expect(shapes[2]).toHaveBeenProgrammaticallyMovedBy(0, 300);
    expect(shapes[3]).not.toHaveBeenProgrammaticallyMoved();
  });

  it('only distributes three or more items', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(200, 600, 100, 50),
    ];

    distributeVerticalCentersEvenly(shapes);

    expect(shapes[0]).not.toHaveBeenProgrammaticallyMoved();
    expect(shapes[1]).not.toHaveBeenProgrammaticallyMoved();
  });
});

