import { dia } from 'jointjs';
import { highlightPadding } from '@/mixins/crownConfig';

export default class {
  constructor(paper) {
    this._paper = paper;
  }

  static factory(element, interactiveFunc, model) {
    const paper = new dia.Paper({
      async: true,
      el: element,
      model,
      sorting: 'sorting-approximate',
      gridSize: 10,
      drawGrid: true,
      clickThreshold: 10,
      perpendicularLinks: true,
      interactive: interactiveFunc,
      highlighting: {
        default: { options: { padding: highlightPadding } },
      },
    });

    paper.translate(168, 20);

    return new this(paper);
  }

  get paper() {
    return this._paper;
  }
}
