import { shapes } from 'jointjs';
import { docIconMarkup, docIconAttrs } from '@/mixins/documentingIcons';


//export default PoolLane;
export function getPoolLine(bounds) {
  const PoolLaneClass = shapes.standard.Rectangle.define('processmaker.modeler.bpmn.poolLane', {
    markup: [
      docIconMarkup('doccircle'),
      docIconMarkup('doclabel'),
      ...shapes.standard.Rectangle.prototype.markup,
    ],
    attrs: {
      ...docIconAttrs('doclabel', { 'x': -108, 'ref-y': 5 }),
      ...docIconAttrs('doccircle', { 'cx': bounds.width  + 22, 'cy': 5 }),
    },
  });

  return new PoolLaneClass();
}
