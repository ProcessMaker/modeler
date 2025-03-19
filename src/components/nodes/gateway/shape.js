import { dia, shapes } from 'jointjs';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup } from '@/mixins/documentingIcons';
import { agentIconMarkup, agentIconAttrs, agentIconAdaptMarkup } from '@/mixins/agentIcons';
const iconSize = 18;

export function getGatewayShape() {
  let markup = [
    ...shapes.standard.Polygon.prototype.markup,
    { tagName: 'image', selector: 'image' },
    docIconMarkup('doccircle'),
    docIconMarkup('doclabel'),
  ];

  markup = docIconAdaptMarkup(markup, true);
  markup.push(agentIconMarkup('agenticon'));
  markup = agentIconAdaptMarkup(markup, true);

  const GatewayShape = dia.Element.define('processmaker.components.nodes.gateway.Shape', {
    markup,
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
      ...docIconAttrs('doclabel', { 'ref-x': 8, 'ref-y': 10 }),
      ...docIconAttrs('doccircle', { 'cx': 30, 'cy': 5 }),
      ...agentIconAttrs('agenticon', { 'ref-x': 30, 'ref-y': 5 }),
    },
  });

  return new GatewayShape();
}