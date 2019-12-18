import moveShapeByKeypress from '@/components/modeler/moveWithArrowKeys';
import PaperManager from '@/components/paperManager';

const moveAmount = PaperManager.gridSize / 2;

describe('moveWithArrowKeys', () => {
  it('should not translate shape if correct keys are not pressed', () => {
    const shape = { translate: jest.fn() };
    moveShapeByKeypress('Enter', shape);

    expect(shape.translate).not.toHaveBeenCalled();
  });

  it.each`
  keyPress | expected
  ${'Up'} | ${[0, -moveAmount]}
  ${'Down'} | ${[0, moveAmount]}
  ${'Left'} | ${[-moveAmount, 0]}
  ${'Right'} | ${[moveAmount, 0]}
  `('should move shape $keyPress direction when the corresponding key is pressed',
  ({ keyPress, expected }) => {
    const shape = { translate: jest.fn() };
    moveShapeByKeypress(keyPress, shape);

    expect(shape.translate).toHaveBeenCalledWith(...expected);
  });
});
