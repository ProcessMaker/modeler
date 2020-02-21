import { dummyShape } from '../../../utilities/dummies';
import { getBoundingBox, getShapesOptions } from '@/components/nodes/utilities/shapeGroup';
import { shapeTypes } from '../../../../e2e/support/constants';
import { canAlign } from '@/components/nodes/utilities/shapeMovement';

describe('bounding box metrics', () => {
  it('handles non-shape objects correctly without breaking', () => {
    const bounds = getBoundingBox({});

    expect(bounds.left).toBe(0);
    expect(bounds.top).toBe(0);
    expect(bounds.bottom).toBe(0);
    expect(bounds.right).toBe(0);
    expect(bounds.width).toBe(0);
    expect(bounds.height).toBe(0);
    expect(bounds.vMiddle).toBe(0);
    expect(bounds.hMiddle).toBe(0);
  });

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
});

describe('shape group alignment options', () => {
  it('cannot align when no shapes are selected', () => {
    expect(getShapesOptions([]).can.align.left).toBe(false);
    expect(getShapesOptions([]).can.align.horizontalCenter).toBe(false);
    expect(getShapesOptions([]).can.align.right).toBe(false);
    expect(getShapesOptions([]).can.align.bottom).toBe(false);
    expect(getShapesOptions([]).can.align.verticalCenter).toBe(false);
    expect(getShapesOptions([]).can.align.top).toBe(false);
  });

  it('cannot align when there are too few shapes selected', () => {
    const shapes = [dummyShape(0, 0, 100, 50)];
    expect(getShapesOptions(shapes).can.align.left).toBe(false);
    expect(getShapesOptions(shapes).can.align.horizontalCenter).toBe(false);
    expect(getShapesOptions(shapes).can.align.right).toBe(false);
    expect(getShapesOptions(shapes).can.align.bottom).toBe(false);
    expect(getShapesOptions(shapes).can.align.verticalCenter).toBe(false);
    expect(getShapesOptions(shapes).can.align.top).toBe(false);
  });

  it('cannot align left when shapes are already left-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(0, 0, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.left).toBe(false);
  });

  it('can align left when shapes are not left-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(20, 0, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.left).toBe(true);
  });


  it('cannot align right when shapes are already right-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(30, 0, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.right).toBe(false);
  });

  it('can align right when shapes are not right-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(0, 0, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.right).toBe(true);
  });

  it('cannot align horizontal-center when shapes are already horizontal-center-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(15, 0, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.horizontalCenter).toBe(false);
  });

  it('can align horizontal-center when shapes are not horizontal-center-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(0, 0, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.horizontalCenter).toBe(true);
  });

  it('cannot align right when shapes are already bottom-aligned', () => {
    const shapes = [
      dummyShape(0, 20, 100, 30),
      dummyShape(0, 0, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.bottom).toBe(false);
  });

  it('can align bottom when shapes are not bottom-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(0, 10, 70, 30),
    ];

    expect(getShapesOptions(shapes).can.align.bottom).toBe(true);
  });


  it('cannot align right when shapes are already top-aligned', () => {
    const shapes = [
      dummyShape(0, 20, 100, 30),
      dummyShape(0, 20, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.top).toBe(false);
  });

  it('can align top when shapes are not top-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(0, 10, 70, 30),
    ];

    expect(getShapesOptions(shapes).can.align.top).toBe(true);
  });

  it('cannot align vertical-center when shapes are already vertical-center-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(0, 10, 70, 30),
    ];

    expect(getShapesOptions(shapes).can.align.verticalCenter).toBe(false);
  });

  it('can align vertical-center when shapes are not vertical-center-aligned', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(0, 20, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.align.verticalCenter).toBe(true);
  });

  it('cannot align dimensionless shapes', () => {
    expect(canAlign({})).toBe(false);
  });

  it('cannot align poolLanes', () => {
    const poolLane = dummyShape(0, 0, 100, 50);
    poolLane.get = () => shapeTypes.poolLane;

    expect(canAlign(poolLane)).toBe(false);
  });

  it('cannot align boundaryEvents', () => {
    const boundaryEvent = dummyShape(0, 0, 100, 50);
    boundaryEvent.get = () => shapeTypes.boundaryEvent;

    expect(canAlign(boundaryEvent)).toBe(false);
  });
});


describe('shape group distribution options', () => {
  it('cannot distribute when no shapes are selected', () => {
    expect(getShapesOptions([]).can.distribute.horizontally).toBe(false);
    expect(getShapesOptions([]).can.distribute.vertically).toBe(false);
  });

  it('cannot distribute when there are too few shapes selected', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 100, 50),
    ];
    expect(getShapesOptions(shapes).can.distribute.horizontally).toBe(false);
    expect(getShapesOptions(shapes).can.distribute.vertically).toBe(false);
  });

  it('can horizontally distribute three or more items', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 70, 50),
      dummyShape(200, 200, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.distribute.horizontally).toBe(true);
  });

  it('can vertically distribute three or more items', () => {
    const shapes = [
      dummyShape(0, 0, 100, 50),
      dummyShape(100, 100, 70, 50),
      dummyShape(200, 200, 70, 50),
    ];

    expect(getShapesOptions(shapes).can.distribute.horizontally).toBe(true);
  });
});
