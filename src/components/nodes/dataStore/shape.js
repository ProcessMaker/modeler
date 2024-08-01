import { shapes, util } from 'jointjs';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup } from '@/mixins/documentingIcons';

export function getDataStoreShape(forDocumenting = false) {
  let markup = [
    ...shapes.standard.Cylinder.prototype.markup,
    { tagName: 'ellipse', selector: 'thirdLine' },
    { tagName: 'ellipse', selector: 'secondLine' },
    { tagName: 'ellipse', selector: 'firstLine' },
    docIconMarkup('doccircle'),
    docIconMarkup('doclabel'),
  ];

  markup = docIconAdaptMarkup(markup, forDocumenting);

  const DataStoreShape =  shapes.standard.Cylinder.extend({
    markup,
    defaults: util.deepSupplement({
      attrs: {
        thirdLine: { refCx: '50%', refRx: '50%', cy: 20, refRy: '20%', 'stroke-width': 2, fill: '#fff', stroke: '#000' },
        secondLine: { refCx: '50%', refRx: '50%', cy: 15, refRy: '20%', 'stroke-width': 2, fill: '#fff', stroke: '#000' },
        firstLine: { refCx: '50%', refRx: '50%', cy: 10, refRy: '20%', 'stroke-width': 2, fill: '#fff', stroke: '#000' },
        label: { refY: 50, fill: '#000' },
        ...docIconAttrs('doclabel', { 'ref-x': 39, 'ref-y': -4 }),
        ...docIconAttrs('doccircle', { 'cx': 40, 'cy': 5 }),
      },
    }, shapes.standard.Cylinder.prototype.defaults),
  });

  return new DataStoreShape();
}
