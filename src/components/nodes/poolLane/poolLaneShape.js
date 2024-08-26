import { shapes } from 'jointjs';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup } from '@/mixins/documentingIcons';

export function getPoolLine(bounds, forDocumenting = false) {
  let markup = [
    ...shapes.standard.Rectangle.prototype.markup,
    docIconMarkup('doccircle'),
    docIconMarkup('doclabel'),
  ];

  markup = docIconAdaptMarkup(markup, forDocumenting);

  const PoolLaneClass = shapes.standard.Rectangle.define('processmaker.modeler.bpmn.poolLane', {
    markup,
    attrs: {
      ...docIconAttrs('doclabel', { 'x': -20, 'y':22 }),
      ...docIconAttrs('doccircle', { 'cx': bounds.width  - 12, 'cy': 12 }),
    },
  });

  const result = new PoolLaneClass();

  // The original type name used in the app is 'PoolLane'
  result.set('type', 'PoolLane');

  return result;
}
