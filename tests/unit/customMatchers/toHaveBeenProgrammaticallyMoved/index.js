import get from 'lodash/get';
import passes from './predicate.js';

const failMessage = (shape) => () => {
  return this.utils.matcherHint('.toHaveBeenProgrammaticallyMoved', 'shape', '') +
    '\n\nExpected:' +
    '\n Shape to have been programmatically moved.' +
    '\n\nReceived: ' +
    (get(shape, 'translate.mock.calls', []).length === 0
      ? '\n Shape has not been moved.'
      : `\n Move has been called, but with dx==0, dy==0: ${this.utils.printReceived(shape.translate.mock.calls)}`);
};

const passMessage = (shape) => () => {
  return this.utils.matcherHint('.not.toHaveBeenProgrammaticallyMoved', 'shape', '') +
    '\n\nExpected:' +
    '\n Shape to not have been programmatically moved.' +
    '\n\nReceived: ' +
    `\n Shape has been moved by: ${this.utils.printReceived(shape.translate.mock.calls)}`;
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
    return { pass: true, message: passMessage(shape) };
  }

  return { pass: false, message: failMessage(shape) };
}
