import { dia } from 'jointjs';

export default class {
  constructor(miniMap) {
    this.miniMap = miniMap;
  }

  static factory(graph, element) {
    const miniPaper = new dia.Paper({
      el: element,
      model: graph,
      width: 300,
      height: 200,
      interactive: false,
    });

    return new this(miniPaper);
  }

  get miniMapPaper() {
    return this.miniMap;
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
