import moveShapeByKeypress, { moveAmount } from '@/components/modeler/moveWithArrowKeys';

describe('moveWithArrowKeys', () => {
  it('should not translate shape if correct keys are not pressed', () => {
    const shape = { translate: jest.fn(), get: jest.fn(() => 'foo') };
    moveShapeByKeypress('Enter', shape);

    expect(shape.translate).toHaveBeenCalledWith(0, 0);
  });

  it.each`
  keyPress | expected
  ${'Up'} | ${[0, -moveAmount]}
  ${'Down'} | ${[0, moveAmount]}
  ${'Left'} | ${[-moveAmount, 0]}
  ${'Right'} | ${[moveAmount, 0]}
  ${'ArrowUp'} | ${[0, -moveAmount]}
  ${'ArrowDown'} | ${[0, moveAmount]}
  ${'ArrowLeft'} | ${[-moveAmount, 0]}
  ${'ArrowRight'} | ${[moveAmount, 0]}
  `('should move shape $keyPress direction when the corresponding key is pressed',
  ({ keyPress, expected }) => {
    const shape = { translate: jest.fn(), get: jest.fn(() => 'foo') };
    moveShapeByKeypress(keyPress, shape);

    expect(shape.translate).toHaveBeenCalledWith(...expected);
  });

  it.each([
    ['PoolLane'],
    ['processmaker.components.nodes.boundaryEvent.Shape'],
  ],
  )('Does not attempt to move an invalid shape', (invalidShapeType) => {
    const shape = { translate: jest.fn(), get: jest.fn(() => invalidShapeType) };
    moveShapeByKeypress('Up', shape);

    expect(shape.translate).not.toHaveBeenCalled();
  });
});
