import { dia } from 'jointjs';

export default class {
  constructor(miniPaper) {
    this.miniPaper = miniPaper;
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

  get miniMap() {
    return this.miniPaper;
  }

  scaleMiniMap() {
    this.miniPaper.scaleContentToFit({ padding: 10, maxScaleX: 0.5, maxScaleY: 0.5 });
  }

  calculateNewPaperPosition(offsetX, offsetY, scaleX, scaleY, clientWidth, clientHeight) {
    const { x, y } = this.miniPaper.paperToLocalPoint(offsetX, offsetY);

    return {
      newX: (clientWidth / 2) - (x * scaleX),
      newY: (clientHeight / 2) - (y * scaleY),
    };
  }
}
