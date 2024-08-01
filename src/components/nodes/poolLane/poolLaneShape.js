import { shapes } from 'jointjs';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup} from '@/mixins/documentingIcons';


//export default PoolLane;
export function getPoolLine(bounds, forDocumenting = false) {
  let markup = [
    docIconMarkup('doccircle'),
    docIconMarkup('doclabel'),
    ...shapes.standard.Rectangle.prototype.markup,
  ];

  markup = docIconAdaptMarkup(markup, forDocumenting);

  const PoolLaneClass = shapes.standard.Rectangle.define('processmaker.modeler.bpmn.poolLane', {
    markup,
    attrs: {
      ...docIconAttrs('doclabel', { 'x': -108, 'ref-y': 5 }),
      ...docIconAttrs('doccircle', { 'cx': bounds.width  + 22, 'cy': 5 }),
    },
  });

  const result = new PoolLaneClass();

  // The original type name used in the app is 'PoolLane'
  result.set('type', 'PoolLane');

  return result;
}
