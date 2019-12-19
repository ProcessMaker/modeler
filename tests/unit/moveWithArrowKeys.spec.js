import moveShapeByKeypress, { moveAmount } from '@/components/modeler/moveWithArrowKeys';

const shapeFactory = (type = 'foo') => ({
  translate: jest.fn(),
  get: jest.fn(() => type),
  getParentCell: () => null,
});

describe('moveWithArrowKeys', () => {
  it('should not translate shape if correct keys are not pressed', () => {
    const shape = shapeFactory();
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
    const shape = shapeFactory();
    moveShapeByKeypress(keyPress, shape);

    expect(shape.translate).toHaveBeenCalledWith(...expected);
  });

  it.each([
    ['PoolLane'],
    ['processmaker.components.nodes.boundaryEvent.Shape'],
  ],
  )('Does not attempt to move an invalid shape', (invalidShapeType) => {
    const shape = shapeFactory(invalidShapeType);
    moveShapeByKeypress('Up', shape);

    expect(shape.translate).not.toHaveBeenCalled();
  });
});
