import { shapes } from 'jointjs';
import { labelWidth } from '@/components/nodes/pool/poolSizes';

const Pool = shapes.standard.Rectangle.define('processmaker.modeler.bpmn.pool', {
  markup: [
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
  },
});

export default Pool;
