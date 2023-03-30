import moveShapeByKeypress, { moveAmount } from '@/components/hotkeys/moveWithArrowKeys';

const shapeFactory = (type = 'foo') => ({
  translate: jest.fn(),
  get: jest.fn(() => type),
  getParentCell: () => null,
});

describe('moveWithArrowKeys', () => {
  it('should not translate shape if correct keys are not pressed', () => {
    const shape = shapeFactory();
    const onAfterMove = jest.fn();
    moveShapeByKeypress('Enter', shape);

    expect(shape.translate).not.toHaveBeenCalled();
    expect(onAfterMove).not.toHaveBeenCalled();
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
    const shape = shapeFactory();
    const onAfterMove = jest.fn();
    moveShapeByKeypress(keyPress, [shape], onAfterMove);

    expect(shape.translate).toHaveBeenCalledWith(...expected, { movedWithArrowKeys: true });
    expect(onAfterMove).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['PoolLane'],
    ['processmaker.components.nodes.boundaryEvent.Shape'],
  ],
  )('Does not attempt to move an invalid shape', (invalidShapeType) => {
    const shape = shapeFactory(invalidShapeType);
    const onAfterMove = jest.fn();
    moveShapeByKeypress('Up', [shape], onAfterMove);

    expect(shape.translate).not.toHaveBeenCalled();
    expect(onAfterMove).not.toHaveBeenCalled();
  });

  it('Does nothing when it does not receive a shape', () => {
    const shape = undefined;
    const onAfterMove = jest.fn();
    moveShapeByKeypress('Up', [shape], onAfterMove);

    expect(onAfterMove).not.toHaveBeenCalled();
  });
});
