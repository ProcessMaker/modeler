import { dia, util } from 'jointjs';
import { defaultNodeColor, invalidNodeColor } from '@/components/nodeColors';
import { gridSize } from '@/graph';

export default class PaperManager {
  #paper;
  preventTranslate = false;

  constructor(paper) {
    this.#paper = paper;
  }

  static gridSize = gridSize;

  static factory(element, interactiveFunc, model) {
    const defaultPadding = 3;
    const paper = new dia.Paper({
      async: true,
      el: element,
      model,
      sorting: 'sorting-approximate',
      gridSize: PaperManager.gridSize,
      drawGrid: true,
      snapLinks: false, // disable snapping of links
      snapElements: false, // disable snapping of elements
      clickThreshold: 10,
      perpendicularLinks: true,
      interactive: interactiveFunc,
      highlighting: {
        default: { options: { padding: defaultPadding } },
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

  set scale(scale) {
    this.#paper.scale(scale);
    this.#paper.trigger('scale:changed');
  }

  roundToNearestGridMultiple(number) {
    return Math.round(number / PaperManager.gridSize) * PaperManager.gridSize;
  }

  ceilToNearestGridMultiple(number) {
    return Math.ceil(number / PaperManager.gridSize) * PaperManager.gridSize;
  }

  translate(x, y) {
    if (this.preventTranslate) {
      return;
    }

    this.#paper.translate(x, y);
    this.#paper.trigger('translate:changed');
  }

  addEventHandler(eventName, callback, callbackScope) {
    this.#paper.on(eventName, callback, callbackScope);
  }

  addOnceHandler(eventName, callback) {
    this.#paper.once(eventName, callback);
  }

  removeEventHandler(eventName, callback, callbackScope) {
    this.#paper.off(eventName, callback, callbackScope);
  }

  setPaperDimensions(width, height) {
    this.#paper.setDimensions(width, height);
  }

  async performAtomicAction(callback) {
    this.#paper.freeze();
    await callback(this.#paper);
    this.#paper.unfreeze();
  }

  clientToGridPoint(clientX, clientY) {
    const paperOrigin = this.#paper.localToPagePoint(0, 0);
    const scale = this.scale;

    return {
      x: this.roundToNearestGridMultiple((clientX - paperOrigin.x) / scale.sx),
      y: this.roundToNearestGridMultiple((clientY - paperOrigin.y) / scale.sy),
    };
  }

  setStateInvalid() {
    this.paper.drawBackground({ color: invalidNodeColor });
  }

  setStateValid() {
    this.paper.drawBackground({ color: defaultNodeColor });
  }

  awaitScheduledUpdates() {
    if (this.#paper._updates.priorities.some(updates => !util.isEmpty(updates))) {
      return new Promise((resolve) => {
        this.addOnceHandler('render:done', resolve);
      });
    }
    return Promise.resolve();
  }
}
