export function dummyShape(x, y, width, height) {
  return {
    position: () => ({ x, y }),
    size: () => ({ width, height }),
    get: () => "dummy",
    translate: jest.fn(),
  };
}
