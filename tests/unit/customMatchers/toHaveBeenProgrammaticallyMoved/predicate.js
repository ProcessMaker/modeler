import get from 'lodash/get';

export default function passes(shape) {
  const zeroTranslationVector = [0, 0];
  const calls = get(shape, 'translate.mock.calls', []);
  return calls.map(call => call.toString()).some(call => call !== zeroTranslationVector.toString());
}
