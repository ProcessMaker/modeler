export const markersLimit = 3;
export const markerSize = 16;
export const markerPadding = 4;

/**
 * Prepare nodes for the Markers to be inserted inside the shapes.
 *
 * @param string selector 
 */
export function markersMarkup(selector) {
  let children = [];
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
      inmediate: true,
      deep: true,
      handler() {
        this.refreshMarkers();
      },
    },
  },
  methods: {
    refreshMarkers(markers = this.markers) {
      // Get shape size
      const { width, height } = this.shape.size();
      for (let position in markers) {
        // Align markers (left-right)
        let paddingX = this.shape.attr(position + '/ref-padding-x');
        paddingX = paddingX === undefined ? markerPadding : paddingX;
        let paddingY = this.shape.attr(position + '/ref-padding-y');
        paddingY = paddingY === undefined ? markerPadding : paddingY;

        if (position.indexOf('Right') !== -1) {
          this.shape.attr(position + '/ref-x', (width - markerSize - paddingX));
        } else if (position.indexOf('Left') !== -1) {
          this.shape.attr(position + '/ref-x', paddingX + (this.hasTaskMarker ? 16 : 0));
        }
        if (position.indexOf('bottom') !== -1) {
          this.shape.attr(position + '/ref-y', height - markerSize - paddingY);
        }

        let c = 0;
        for (let i = 0; i < markersLimit; i++) {
          this.shape.attr(position + '.' + i + '/xlink:href', null);
        }
        for (let marker in markers[position]) {
          this.shape.attr(position + '.' + c + '/xlink:href', markers[position][marker]);
          c++;
          if (c >= markersLimit) {
            break;
          }
        }
        this.shape.attr(position + '/ref-width', markerSize * c);

        // Align markers (center)
        if (position.indexOf('Center') !== -1) {
          this.shape.attr(position + '/ref-x', (width - c * markerSize) / 2);
        }
      }
    },
  },
};
