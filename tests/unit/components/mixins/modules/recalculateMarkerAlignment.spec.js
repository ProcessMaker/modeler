import recalculateMarkerAlignment from '@/mixins/modules/recalculateMarkerAlignment';
import TaskShape from '@/components/nodes/task/shape';

describe('recalculateMarkerAlignment', () => {
  it('sets expected x positions for empty markers', () => {
    const shape = new TaskShape();
    const markers = {
      topLeft: {},
      topCenter: {},
      topRight: {},
      bottomLeft: {},
      bottomCenter: {},
      bottomRight: {},
    };

    recalculateMarkerAlignment(markers, shape);

    expect(shape.attributes.attrs.bottomCenter).toEqual({
      'ref': 'rect',
      'ref-width': 0,
      'ref-x': 50,
      'ref-y': 40,
    });

    expect(shape.attributes.attrs.topCenter).toEqual({
      'ref': 'rect',
      'ref-width': 0,
      'ref-x': 50,
      'ref-y': 4,
    });

    ['bottomLeft', 'bottomCenter', 'topLeft', 'topCenter'].forEach((markerPosition) => {
      expect(shape.attributes.attrs[`${markerPosition}.0`]['ref-x']).toEqual(0);
      expect(shape.attributes.attrs[`${markerPosition}.1`]['ref-x']).toEqual(16);
      expect(shape.attributes.attrs[`${markerPosition}.2`]['ref-x']).toEqual(32);
    });

    ['bottomRight', 'topRight'].forEach((markerPosition) => {
      expect(shape.attributes.attrs[`${markerPosition}.0`]['ref-x']).toEqual(-0);
      expect(shape.attributes.attrs[`${markerPosition}.1`]['ref-x']).toEqual(-16);
      expect(shape.attributes.attrs[`${markerPosition}.2`]['ref-x']).toEqual(-32);
    });

  });
});
