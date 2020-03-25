import get from 'lodash/get';
import passes from './predicate.js';

const failMessage = (shape, utils) => () => {
  return utils.matcherHint('.toHaveBeenProgrammaticallyMoved', 'shape', '') +
    '\n\nExpected:' +
    '\n Shape to have been programmatically moved.' +
    '\n\nReceived: ' +
    (get(shape, 'translate.mock.calls', []).length === 0
      ? '\n Shape has not been moved.'
      : `\n Move has been called, but with dx==0, dy==0: ${utils.printReceived(shape.translate.mock.calls)}`);
};

const passMessage = (shape, utils) => () => {
  return this.utils.matcherHint('.not.toHaveBeenProgrammaticallyMoved', 'shape', '') +
    '\n\nExpected:' +
    '\n Shape to not have been programmatically moved.' +
    '\n\nReceived: ' +
    `\n Shape has been moved by: ${utils.printReceived(shape.translate.mock.calls)}`;
};

/**
 * Matcher to ensure that a shape has been (programmatically) moved.
 * @param shape
 */
export default function toHaveBeenProgrammaticallyMoved(shape) {
  if (!shape || !shape.translate || !shape.translate.mock) {
    return { pass: this.isNot, message: () => `${this.utils.printReceived(shape)} does not seem to be a movable shape.` };
  }

  if (passes(shape)) {
    return { pass: true, message: passMessage(shape, this.utils) };
  }

  return { pass: false, message: failMessage(shape, this.utils) };
}
