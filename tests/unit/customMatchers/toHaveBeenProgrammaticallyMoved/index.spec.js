import toHaveBeenProgrammaticallyMoved from './';
import { dummyShape } from '../../utilities/dummies';

expect.extend({ toHaveBeenProgrammaticallyMoved });

describe('toHaveBeenProgrammaticallyMoved', () => {
  it('passes when translate is called with a non-zero translation vector', () => {
    const testShape = dummyShape(0, 0, 0, 0);

    testShape.translate(1, 1);

    expect(testShape).toHaveBeenProgrammaticallyMoved();
  });

  it('fails when translate is called with a zero translation vector', () => {
    const testShape = dummyShape(0, 0, 0, 0);

    testShape.translate(0, 0);

    expect(() => expect(testShape).toHaveBeenProgrammaticallyMoved()).toThrow();
  });

  it('fails when translate is never called', () => {
    const testShape = dummyShape(0, 0, 0, 0);

    expect(() => expect(testShape).toHaveBeenProgrammaticallyMoved()).toThrow();
  });

  it('fails when the shape is undefined', () => {
    const testShape = undefined;

    expect(() => expect(testShape).toHaveBeenProgrammaticallyMoved()).toThrow();
  });

  it('fails when the shape\'s translate is not a jest.fn()', () => {
    const testShape = {
      translate: undefined,
    };
    expect(() => expect(testShape).toHaveBeenProgrammaticallyMoved()).toThrow();
  });

  it('it fails if a .not has been moved', () => {
    const testShape = dummyShape(0, 0, 0, 0);

    testShape.translate(1, 2);

    expect(() => expect(testShape).not.toHaveBeenProgrammaticallyMoved()).toThrow();
  });
});
