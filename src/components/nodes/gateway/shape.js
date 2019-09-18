import { dia, shapes } from 'jointjs';

const iconSize = 18;

export default dia.Element.define('processmaker.components.nodes.gateway.Shape', {
  markup: [
    ...shapes.standard.Polygon.prototype.markup,
    { tagName: 'image', selector: 'image' },
  ],
  attrs: {
    body: {
      strokeWidth: 2,
      stroke: '#000000',
      refPointsKeepOffset: '40,0, 80,40, 40,80, 0,40',
      fill: '#FFFFFF',
    },
    label: {
      textVerticalAnchor: 'top',
      textAnchor: 'middle',
      refX: '50%',
      refY: '50',
      fontSize: 14,
      fill: '#333333',
    },
    image: {
      width: iconSize,
      height: iconSize,
      fill: 'transparent',
      xlinkHref: '',
      refX: '50%',
      refX2: -(iconSize / 2),
      refY: '50%',
      refY2: -(iconSize / 2),
    },
  },
});
