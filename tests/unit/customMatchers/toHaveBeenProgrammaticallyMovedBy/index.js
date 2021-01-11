import passes from './predicate';

const failMessage = (shape, dx, dy, utils) => () => {
  const expected = [dx, dy];
  return utils.matcherHint('.toHaveBeenProgrammaticallyMovedBy', 'shape', '') +
    '\n\n' +
    `Expected:\n Shape to have been programmatically moved by ${utils.printReceived(expected)}.` +
    '\n\nReceived: ' +
    (shape.translate.mock.calls.length === 0
      ? '\n Shape has not been moved.'
      : `\n Shape has been moved by: ${utils.printReceived(shape.translate.mock.calls)}`);
};

const passMessage = (shape, dx, dy, utils) => () => {
  const expected = [dx, dy];
  return utils.matcherHint('.not.toHaveBeenProgrammaticallyMovedBy', 'shape', '') +
    '\n\n' +
    `Expected:\n Shape to not have been programmatically moved by ${utils.printReceived(expected)}.` +
    '\n\nReceived: ' +
    `\n Shape has been moved by: ${utils.printReceived(shape.translate.mock.calls)}`;
};

/**
 * Matcher to ensure that a shape has been (programmatically) moved by a certain dx and dy.
 * @param shape
 * @param dx
 * @param dy
 */
export default function toHaveBeenProgrammaticallyMovedBy(shape, dx, dy) {
  if (!shape || !shape.translate) {
    return { pass: this.isNot, message: () => `${this.utils.printReceived(shape)} does not seem to be a movable shape.` };
  }

  if (passes(shape, dx, dy)) {
    return { pass: true, message: passMessage(shape, dx, dy, this.utils) };
  }

  return { pass: false, message: failMessage(shape, dx, dy, this.utils) };
}
