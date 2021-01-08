import { shapes, util } from 'jointjs';

export default shapes.standard.Cylinder.extend({
  markup: [
    ...shapes.standard.Cylinder.prototype.markup,
    { tagName: 'ellipse', selector: 'thirdLine' },
    { tagName: 'ellipse', selector: 'secondLine' },
    { tagName: 'ellipse', selector: 'firstLine' },
  ],
  defaults: util.deepSupplement({
    attrs: {
      thirdLine: { refCx: '50%', refRx: '50%', cy: 20, refRy: '20%', 'stroke-width': 2, fill: '#fff', stroke: '#000' },
      secondLine: { refCx: '50%', refRx: '50%', cy: 15, refRy: '20%', 'stroke-width': 2, fill: '#fff', stroke: '#000' },
      firstLine: { refCx: '50%', refRx: '50%', cy: 10, refRy: '20%', 'stroke-width': 2, fill: '#fff', stroke: '#000' },
      label: { refY: 50, fill: '#000' },
    },
  }, shapes.standard.Cylinder.prototype.defaults),
});
