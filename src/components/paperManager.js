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

  get scale() {
    return this._paper.scale();
  }

  translate(x, y) {
    this._paper.translate(x, y);
  }

  addEventHandler(eventName, callback, objectScope) {
    this._paper.on(eventName, callback, objectScope);
  }

  addOnceHandler(eventName, callback) {
    this._paper.once(eventName, callback);
  }

  removeEventHandler(eventName, callback, objectScope) {
    this._paper.off(eventName, callback, objectScope);
  }

  freezePaper() {
    this._paper.freeze();
  }

  unfreezePaper() {
    this._paper.unfreeze();
  }

  performAtomicAction(callback) {
    this._paper.freeze();
    callback(this._paper);
    this._paper.unfreeze();
  }
}
