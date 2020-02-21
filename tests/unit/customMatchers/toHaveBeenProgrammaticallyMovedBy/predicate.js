import get from 'lodash/get';

export default function passes(shape, dx, dy ) {
  const callParams = [dx, dy];
  const calls = get(shape, 'translate.mock.calls', []);
  return calls.map(call => call.toString()).includes(callParams.toString());
}
