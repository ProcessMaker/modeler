import { dia } from 'jointjs';

export default dia.Element.define(
  'processmaker.components.nodes.gateway.Shape',
  {
    size: {
      width: 80,
      height: 80,
    },
    attrs: {
      '.body': {
        strokeWidth: 2,
        stroke: '#000000',
        points: '40,0, 80,40, 40,80, 0,40',
        fill: '#FFFFFF',
      },
      '.label': {
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refX: '50%',
        refY: '50',
        fontSize: 14,
        fill: '#333333',
      },
      image: {
        width: 40,
        height: 40,
        fill: 'transparent',
        'xlink:href': '',
        transform: 'translate(20,20)',
      },
    },
  },
  {
    markup:
      '<g class="rotatable"><g class="scalable"><polygon class="body"/><image/></g></g><text class="label"/>',
  }
);
