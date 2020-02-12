import passes from './predicate';

const failMessage = (shape, dx, dy) => () => {
  const expected = [dx, dy];
  return this.utils.matcherHint('.toHaveBeenProgrammaticallyMovedBy', 'shape', '') +
    '\n\n' +
    `Expected:\n Shape to have been programmatically moved by ${this.utils.printReceived(expected)}.` +
    '\n\nReceived: ' +
    (shape.translate.mock.calls.length === 0
      ? '\n Shape has not been moved.'
      : `\n Shape has been moved by: ${this.utils.printReceived(shape.translate.mock.calls)}`);
};

const passMessage = (shape, dx, dy) => () => {
  const expected = [dx, dy];
  return this.utils.matcherHint('.not.toHaveBeenProgrammaticallyMovedBy', 'shape', '') +
    '\n\n' +
    `Expected:\n Shape to not have been programmatically moved by ${this.utils.printReceived(expected)}.` +
    '\n\nReceived: ' +
    `\n Shape has been moved by: ${this.utils.printReceived(shape.translate.mock.calls)}`;
};

/**
 * Matcher to ensure that a shape has been (programmatically) moved by a certain dx and dy.
 * @param shape
 * @param dx
 * @param dy
 */
export default function toHaveBeenProgrammaticallyMovedBy(shape, dx, dy) {
  if (!shape || !shape.translate) {
    return {pass: this.isNot, message: () => `${this.utils.printReceived(shape)} does not seem to be a movable shape.`};
  }

  if (passes(shape, dx, dy)) {
    return { pass: true, message: passMessage(shape, dx, dy) };
  }

  return { pass: false, message: failMessage(shape, dx, dy) };
}
