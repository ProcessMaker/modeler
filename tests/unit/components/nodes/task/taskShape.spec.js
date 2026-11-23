import { getTaskShape } from '@/components/nodes/task/shape';

describe('task documentation shape', () => {
  it('includes documentation markers in documenting mode', () => {
    const shape = getTaskShape(true);
    const selectors = shape.markup.map(item => item.selector);

    expect(selectors).toEqual(expect.arrayContaining(['doccircle', 'doclabel']));
  });

  it('excludes documentation markers in designer mode', () => {
    const shape = getTaskShape(false);
    const selectors = shape.markup.map(item => item.selector);

    expect(selectors).not.toEqual(expect.arrayContaining(['doccircle', 'doclabel']));
  });
});
