import { defaultNodeColor } from './nodeColors';

export default function resetShapeColor(shape)
{
  shape.attr('body/fill', shape.attr('body/originalFill') || defaultNodeColor);
}
