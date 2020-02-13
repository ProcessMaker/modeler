export function dummyShape(x, y, width, height) {
  return {
    position: () => {
      return { x, y };
    },
    size: () => {
      return { width, height };
    },
    get: () => 'dummy',
    translate: jest.fn(),
  };
}
