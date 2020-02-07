import {
  alignBottom,
  alignLeft,
  alignRight,
  alignTop,
  centerX,
  centerY,
  getBoundingBox,
} from '@/components/nodes/utilities/AlignShapes';

describe('Shape Alignment', () => {
  it('can calculate a correct bounding box with one shape', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
    ];

    const bounds = getBoundingBox(shapes);

    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(0);
    expect(bounds.bottom).toBe(50);
    expect(bounds.right).toBe(100);
    expect(bounds.width).toBe(100);
    expect(bounds.height).toBe(50);
    expect(bounds.vMiddle).toBe(25);
    expect(bounds.hMiddle).toBe(50);
  });

  it('can calculate a correct bounding box with multiple shapes', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    const bounds = getBoundingBox(shapes);
    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(0);
    expect(bounds.bottom).toBe(250);
    expect(bounds.right).toBe(300);
    expect(bounds.width).toBe(300);
    expect(bounds.height).toBe(250);
    expect(bounds.vMiddle).toBe(125);
    expect(bounds.hMiddle).toBe(150);
  });

  it('can align left', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    alignLeft(shapes);

    expect(shapes[0].translate).toHaveBeenCalledWith(0, 0);
    expect(shapes[1].translate).toHaveBeenCalledWith(-100, 0);
    expect(shapes[2].translate).toHaveBeenCalledWith(-200, 0);
  });

  it('can align right', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    alignRight(shapes);

    expect(shapes[0].translate).toHaveBeenCalledWith(200, 0);
    expect(shapes[1].translate).toHaveBeenCalledWith(100, 0);
    expect(shapes[2].translate).toHaveBeenCalledWith(0, 0);
  });

  it('can align top', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    alignTop(shapes);

    expect(shapes[0].translate).toHaveBeenCalledWith(0, 0);
    expect(shapes[1].translate).toHaveBeenCalledWith(0, -100);
    expect(shapes[2].translate).toHaveBeenCalledWith(0, -200);
  });

  it('can align bottom', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    alignBottom(shapes);

    expect(shapes[0].translate).toHaveBeenCalledWith(0, 200);
    expect(shapes[1].translate).toHaveBeenCalledWith(0, 100);
    expect(shapes[2].translate).toHaveBeenCalledWith(0, 0);
  });

  it('can center X', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    centerX(shapes);

    expect(shapes[0].translate).toHaveBeenCalledWith(100, 0);
    expect(shapes[1].translate).toHaveBeenCalledWith(0, 0);
    expect(shapes[2].translate).toHaveBeenCalledWith(-100, 0);
  });

  it('can center Y', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
      dummyShape(200, 200, 100, 50),
    ];

    centerY(shapes);

    expect(shapes[0].translate).toHaveBeenCalledWith(0, 100);
    expect(shapes[1].translate).toHaveBeenCalledWith(0, 0);
    expect(shapes[2].translate).toHaveBeenCalledWith(0, -100);
  });

});


function dummyShape(x, y, width, height) {
  return {
    position: () => {
      return { x, y };
    },
    size: () => {
      return { width, height };
    },
    translate: jest.fn(),
  };
}
