import toHaveBeenProgrammaticallyMovedBy from './index';
import { dummyShape } from '../../utilities/dummies';

expect.extend({ toHaveBeenProgrammaticallyMovedBy });

describe('toHaveBeenProgrammaticallyMovedBy', () => {
  it('passes when translate() is called with the expected translation vector', () => {
    const testShape = dummyShape(0, 0, 0, 0);
    const dx = 1;
    const dy = 2;

    testShape.translate(dx, dy);

    expect(testShape).toHaveBeenProgrammaticallyMovedBy(dx, dy);
  });

  it('passes when translate() is ever called with an expected translation vector', () => {
    const testShape = dummyShape(0, 0, 0, 0);
    const dx = 123;
    const dy = 456;

    testShape.translate(1, 2);
    testShape.translate(dx, dy);
    testShape.translate(3, 4);

    expect(testShape).toHaveBeenProgrammaticallyMovedBy(dx, dy);
  });

  it('fails if translate() was called with an unexpected translation vector', () => {
    const testShape = dummyShape(0, 0, 0, 0);
    const dx = 1;
    const dy = 2;

    testShape.translate(123, 456);

    expect(() => expect(testShape).toHaveBeenProgrammaticallyMovedBy(dx, dy)).toThrow();
  });

  it('fails if the translate() fn was never called', () => {
    const testShape = dummyShape(0, 0, 0, 0);
    const dx = 1;
    const dy = 2;

    expect(() => expect(testShape).toHaveBeenProgrammaticallyMovedBy(dx, dy)).toThrow();
  });
  it('fails when the shape is undefined', () => {
    const testShape = undefined;
    const dx = 1;
    const dy = 2;

    expect(() => expect(testShape).toHaveBeenProgrammaticallyMovedBy(dx, dy)).toThrow();
  });

  it('fails when the shape\'s translate is not a jest.fn()', () => {
    const testShape = {
      translate: undefined,
    };
    const dx = 1;
    const dy = 2;
    expect(() => expect(testShape).toHaveBeenProgrammaticallyMovedBy(dx, dy)).toThrow();
  });

  it('it fails if a .not has been moved', () => {
    const testShape = dummyShape(0, 0, 0, 0);
    const dx = 1;
    const dy = 2;

    testShape.translate(1, 2);

    expect(() => expect(testShape).not.toHaveBeenProgrammaticallyMovedBy(dx, dy)).toThrow();
  });
});
