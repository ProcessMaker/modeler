export const markersLimit = 3;
export const markerSize = 16;
export const markerPadding = 4;

export default function recalculateMarkerAlignment(markers, shape) {
  const { width, height } = shape.size();

  for (let position in markers) {

    alignMarkersFromLeftToRight(shape, position, width);
    alignMarkersFromBottom(shape, position, height);
    alignMarkersFromCenter(shape, position, markers, width);
  }
}

function getPadding(shape, position) {
  let padding = shape.attr(position);
  return padding === undefined ? markerPadding : padding;
}

function alignMarkersFromLeftToRight(shape, position, width) {
  let paddingX = getPadding(shape, position + '/ref-padding-x');
  if (position.indexOf('Right') !== -1) {
    shape.attr(position + '/ref-x', (width - markerSize - paddingX));
  } else if (position.indexOf('Left') !== -1) {
    shape.attr(position + '/ref-x', paddingX + (hasTaskMarker(shape) ? 16 : 0));
  }
}

function alignMarkersFromBottom(shape, position, height) {
  let paddingY = getPadding(shape, position + '/ref-padding-y');
  if (position.indexOf('bottom') !== -1) {
    shape.attr(position + '/ref-y', height - markerSize - paddingY);
  }
}

function alignMarkersFromCenter(shape, position, markers, width) {
  let c = 0;
  for (let i = 0; i < markersLimit; i++) {
    shape.attr(position + '.' + i + '/xlink:href', null);
  }

  const orderedMarkers = orderMarkers(markers, position);

  for (let marker in orderedMarkers) {
    shape.attr(position + '.' + c + '/xlink:href', markers[position][marker]);
    c++;
    if (c >= markersLimit) {
      break;
    }
  }
  shape.attr(position + '/ref-width', markerSize * c);
  if (position.indexOf('Center') !== -1) {
    shape.attr(position + '/ref-x', (width - c * markerSize) / 2);
  }
}

function orderMarkers(markers, position) {
  if (position === 'bottomCenter') {
    const orderedMarkers = {};
    Object.keys(markers[position]).sort().forEach(key => {
      orderedMarkers[key] = markers[position][key];
    });
    return orderedMarkers;
  }
  return markers[position];
}

function hasTaskMarker(shape) {
  return !!shape.attr('image/xlink:href');
}
