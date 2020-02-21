import {
  shapeBottom,
  shapeCenterX,
  shapeCenterY,
  shapeLeft,
  shapeRight,
  shapeTop,
} from '@/components/nodes/utilities/shapeMetrics';
import { dummyShape } from '../../../utilities/dummies';

describe('Shape Metrics Utilities', () => {
  it('returns x middle correctly', () => {
    expect(shapeCenterX(dummyShape(0, 0, 100, 0))).toBe(50);
  });

  it('returns y middle correctly', () => {
    expect(shapeCenterY(dummyShape(0, 0, 0, 100))).toBe(50);
  });

  it('returns left correctly', () => {
    expect(shapeLeft(dummyShape(10, 0, 90, 0))).toBe(10);
  });

  it('returns top correctly', () => {
    expect(shapeTop(dummyShape(0, 5, 0, 35))).toBe(5);
  });

  it('returns right correctly', () => {
    expect(shapeRight(dummyShape(10, 0, 90, 0))).toBe(100);
  });

  it('returns bottom correctly', () => {
    expect(shapeBottom(dummyShape(0, 5, 0, 35))).toBe(40);
  });
});

