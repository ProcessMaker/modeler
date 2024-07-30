import { shapes } from 'jointjs';
import { labelWidth } from '@/components/nodes/pool/poolSizes';
import { docIconMarkup, docIconAttrs } from '@/mixins/documentingIcons';


const Pool = shapes.standard.Rectangle.define('processmaker.modeler.bpmn.pool', {
  markup: [
    docIconMarkup('doccircle'),
    docIconMarkup('doclabel'),
    ...shapes.standard.Rectangle.prototype.markup,
    { tagName: 'polyline', selector: 'polyline' },
  ],
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
    ...docIconAttrs('doclabel', { 'x': -10, 'ref-y': -4 }),
    ...docIconAttrs('doccircle', { 'cx': -18, 'cy': 5 }),
  },
});

export default Pool;
