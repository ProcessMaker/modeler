import passes from './predicate';
import { dummyShape } from '../../utilities/dummies';

describe('toHaveBeenProgrammaticallyMovedBy predicate', () => {
  it('passes when translate() is called with the expected params', () => {
    const testShape = dummyShape(0, 0, 0, 0);
    const dx = 1;
    const dy = 2;

    testShape.translate(dx, dy);

    expect(passes(testShape, dx, dy)).toBe(true);
  });
});
