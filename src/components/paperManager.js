import { dia } from 'jointjs';
import { highlightPadding } from '@/mixins/crownConfig';

export default class {
  #paper;

  constructor(paper) {
    this.#paper = paper;
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
    return this.#paper;
  }

  get scale() {
    return this.#paper.scale();
  }

  translate(x, y) {
    this.#paper.translate(x, y);
  }

  addEventHandler(eventName, callback, objectScope) {
    this.#paper.on(eventName, callback, objectScope);
  }

  addOnceHandler(eventName, callback) {
    this.#paper.once(eventName, callback);
  }

  removeEventHandler(eventName, callback, objectScope) {
    this.#paper.off(eventName, callback, objectScope);
  }

  freezePaper() {
    this.#paper.freeze();
  }

  unfreezePaper() {
    this.#paper.unfreeze();
  }

  performAtomicAction(callback) {
    this.#paper.freeze();
    callback(this.#paper);
    this.#paper.unfreeze();
  }
}
