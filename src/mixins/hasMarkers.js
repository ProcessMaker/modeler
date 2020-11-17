export const markersLimit = 3;
export const markerSize = 16;
export const markerPadding = 4;
import recalculateMarkerAlignment from '@/mixins/modules/recalculateMarkerAlignment';

/**
 * Prepare nodes for the Markers to be inserted inside the shapes.
 *
 * @param string selector
 */
export function markersMarkup(selector) {
  const children = [];
  for (let i = 0; i < markersLimit; i++) {
    children.push({ tagName: 'image', selector: selector + '.' + i });
  }
  return {
    tagName: 'g',
    selector,
    children,
  };
}

/**
 * Define attributes for the markers.
 *
 * @param string name
 * @param object base
 * @param int length
 */
export function markersAttrs(name, base, inverted = 1) {
  let attrs = {};
  attrs[name] = base;
  for (let i = 0; i < markersLimit; i++) {
    attrs[name + '.' + i] = { 'ref-x': i * markerSize * inverted, 'ref-y': 0, width: markerSize, height: markerSize };
  }
  return attrs;
}

export default {
  data() {
    return {
      markers: {
        topLeft: {},
        topCenter: {},
        topRight: {},
        bottomLeft: {},
        bottomCenter: {},
        bottomRight: {},
      },
    };
  },
  watch: {
    markers: {
      deep: true,
      handler() {
        this.recalcMarkersAlignment();
      },
    },
  },
  methods: {
    recalcMarkersAlignment() {
      recalculateMarkerAlignment(this.markers, this.shape);
    },
  },
};
