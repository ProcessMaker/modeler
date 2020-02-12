import { dummyShape } from '../../../utilities/dummies';
import { getBoundingBox } from '@/components/nodes/utilities/shapeGroup';

describe('shape group', () => {
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
});
