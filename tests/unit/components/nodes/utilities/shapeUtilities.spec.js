import { getShapeMiddleX, getShapeMiddleY } from '@/components/nodes/utilities/ShapeUtilities';
import { dummyShape } from './dummies';

describe('Shape Metrics and Translation Utilities', () => {
  it('returns x middle correctly', () => {
    const middleX = getShapeMiddleX(dummyShape(0, 0, 100, 0));
    expect(middleX).toBe(50);
  });

  it('returns y middle correctly', () => {
    const middleY = getShapeMiddleY(dummyShape(0, 0, 0, 100));
    expect(middleY).toBe(50);
  });
});

