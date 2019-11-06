import { dia } from 'jointjs';

export default class MiniMapManager {
  #miniMap;

  constructor(miniMap) {
    this.#miniMap = miniMap;
  }

  static factory(graph, element) {
    const miniMap = new dia.Paper({
      el: element,
      model: graph,
      width: 230,
      height: 200,
      interactive: false,
    });

    return new this(miniMap);
  }

  get miniMap() {
    return this.#miniMap;
  }

  scaleMiniMap() {
    this.miniMap.scaleContentToFit({ padding: 10, maxScaleX: 0.5, maxScaleY: 0.5 });
  }

  calculateNewPaperPosition(offsetX, offsetY, scaleX, scaleY, clientWidth, clientHeight) {
    const { x, y } = this.miniMap.paperToLocalPoint(offsetX, offsetY);

    return {
      newX: (clientWidth / 2) - (x * scaleX),
      newY: (clientHeight / 2) - (y * scaleY),
    };
  }
}
