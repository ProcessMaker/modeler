import { bar } from '../../src/foo.js';

describe('Unit tests', () => {
  it('always passes when run', () => {
    bar();

    expect(true).toBe(true);
  });
});
