import passes from './predicate';
import { dummyShape } from '../../utilities/dummies';

describe('toHaveBeenProgrammaticallyMoved predicate', () => {
  it('passes when translate is called with a non-zero translation vector', () => {
    const testShape = dummyShape(0, 0, 0, 0);

    testShape.translate(1, 1);

    expect(passes(testShape)).toBe(true);
  });

  it('fails when translate is called with a zero translation vector', () => {
    const testShape = dummyShape(0, 0, 0, 0);

    testShape.translate(0, 0);

    expect(passes(testShape)).toBe(false);
  });

  it('fails when translate has not been called', () => {
    const testShape = dummyShape(0, 0, 0, 0);

    expect(passes(testShape)).toBe(false);
  });
});
