import { markersAttrs, markersMarkup } from '@/mixins/hasMarkers';

describe('hasMarkers', () => {
  it('markersMarkup generates markers markup', () => {
    const selector = 'topLeft';
    const expected = {
      'children': [
        {
          'selector': 'topLeft.0',
          'tagName': 'image',
        },
        {
          'selector': 'topLeft.1',
          'tagName': 'image',
        },
        {
          'selector': 'topLeft.2',
          'tagName': 'image',
        },
      ],
      'selector': 'topLeft',
      'tagName': 'g',
    };


    expect(markersMarkup(selector)).toEqual(expected);
  });

  it('markersAttrs generates the shape attributes for the marker, inverted', () => {
    const expected = {
      'topRight': {
        'ref': 'circle',
        'ref-padding-x': 0,
        'ref-x': 26,
        'ref-y': -20,
      },
      'topRight.0': {
        'height': 16,
        'ref-x': -0,
        'ref-y': 0,
        'width': 16,
      },
      'topRight.1': {
        'height': 16,
        'ref-x': -16,
        'ref-y': 0,
        'width': 16,
      },
      'topRight.2': {
        'height': 16,
        'ref-x': -32,
        'ref-y': 0,
        'width': 16,
      },
    };

    expect(markersAttrs('topRight', { ref: 'circle', 'ref-x': 26, 'ref-y': -20, 'ref-padding-x': 0 }, -1)).toEqual(expected);
  });

  it('markersAttrs generates the shape attributes for the marker', () => {
    const expected = {
      'bottomCenter': {
        'ref': 'rect',
      },
      'bottomCenter.0': {
        'height': 16,
        'ref-x': 0,
        'ref-y': 0,
        'width': 16,
      },
      'bottomCenter.1': {
        'height': 16,
        'ref-x': 16,
        'ref-y': 0,
        'width': 16,
      },
      'bottomCenter.2': {
        'height': 16,
        'ref-x': 32,
        'ref-y': 0,
        'width': 16,
      },
    };

    expect(markersAttrs('bottomCenter', { ref: 'rect' })).toEqual(expected);
  });
});
