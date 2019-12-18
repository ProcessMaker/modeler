import moveShapeByKeypress, { movementKeys } from '@/components/modeler/moveWithArrowKeys';
import PaperManager from '@/components/paperManager';

const moveAmount = PaperManager.gridSize / 2;

describe('moveWithArrowKeys', () => {
  it('should not translate shape if correct keys are not pressed', () => {
    const shape = { translate: jest.fn() };
    moveShapeByKeypress('Enter', shape);

    expect(shape.translate).not.toHaveBeenCalled();
  });

  it('should move shape up when up arrow is pressed', () => {
    const shape = { translate: jest.fn() };
    moveShapeByKeypress(movementKeys.up[0], shape);

    expect(shape.translate).toHaveBeenCalledWith(0, -moveAmount);
  });

  it('should move shape down when down arrow is pressed', () => {
    const shape = { translate: jest.fn() };
    moveShapeByKeypress(movementKeys.down[0], shape);

    expect(shape.translate).toHaveBeenCalledWith(0, moveAmount);
  });

  it('should move shape left when left arrow is pressed', () => {
    const shape = { translate: jest.fn() };
    moveShapeByKeypress(movementKeys.left[0], shape);

    expect(shape.translate).toHaveBeenCalledWith(-moveAmount, 0);
  });

  it('should move shape right when right arrow is pressed', () => {
    const shape = { translate: jest.fn() };
    moveShapeByKeypress(movementKeys.right[0], shape);

    expect(shape.translate).toHaveBeenCalledWith(moveAmount, 0);
  });
});
