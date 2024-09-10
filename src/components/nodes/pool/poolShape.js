import { shapes } from 'jointjs';
import { labelWidth } from '@/components/nodes/pool/poolSizes';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup } from '@/mixins/documentingIcons';


export function getPoolShape(forDocumenting = false) {
  let markup = [
    ...shapes.standard.Rectangle.prototype.markup,
    docIconMarkup('doccircle'),
    docIconMarkup('doclabel'),
    { tagName: 'polyline', selector: 'polyline' },
  ];

  markup = docIconAdaptMarkup(markup, forDocumenting);

  const PoolShape = shapes.standard.Rectangle.define('processmaker.modeler.bpmn.pool', {
    markup,
    attrs: {
      label: {
        fill: 'black',
        transform: 'rotate(-90)',
        refX: labelWidth / 2,
      },
      polyline: {
        refPointsKeepOffset: `${labelWidth},0 ${labelWidth},200`,
        stroke: '#000',
        fill: '#fff',
        strokeWidth: 2,
      },
      ...docIconAttrs('doclabel', { 'x': 28, 'ref-y': 0 }),
      ...docIconAttrs('doccircle', { 'cx': 12, 'cy': 12 }),
    },
  });

  return new PoolShape();
}