import { bar } from '@/foo.js';

/**
 * This is a stub test, added to ensure that Jest is setup and working.
 * This test should be removed along with the file /src/foo.js
 */
describe('Unit tests', () => {
  it('always passes when run', () => {
    const value = bar();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });
});
