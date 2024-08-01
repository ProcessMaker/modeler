import { shapes, util } from 'jointjs';
import { docIconMarkup, docIconAttrs, docIconAdaptMarkup } from '@/mixins/documentingIcons';

export function getDataObjectShape(forDocumenting = false) {
  let markup = [
    ...shapes.standard.Path.prototype.markup,
    docIconMarkup('doccircle'),
    docIconMarkup('doclabel'),
  ];

  markup = docIconAdaptMarkup(markup, forDocumenting);

  const DataObjectShape = shapes.standard.Path.extend({
    markup,
    defaults: util.deepSupplement({
      attrs: {
        label: { refY: 65, text: '', fill: 'black' },
        body: { refD: 'M1,1 L25,1 L35,10 L35,49 L1,49 L1,1 M24,1 L24,10 L35,10' },
        ...docIconAttrs('doclabel', { 'ref-x': 39, 'ref-y': -4 }),
        ...docIconAttrs('doccircle', { 'cx': 40, 'cy': 5 }),
      },
    }, shapes.standard.Path.prototype.defaults),
  });

  return new DataObjectShape();
}