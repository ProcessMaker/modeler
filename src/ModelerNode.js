import { g } from 'jointjs';

export default class ModelerNode {
  constructor(type, nodeRegistry, moddle, $t) {
    this.type = type;
    this.definition = nodeRegistry[type].definition(moddle, $t);
    this.diagram = nodeRegistry[type].diagram(moddle);
  }

  isType(bpmnType) {
    return this.bpmnType === bpmnType;
  }

  get bpmnType() {
    return this.definition.$type;
  }

  getSize() {
    return {
      width: this.diagram.bounds.width,
      height: this.diagram.bounds.height,
    };
  }

  setPosition({ x, y }) {
    this.diagram.bounds.x = x;
    this.diagram.bounds.y = y;
  }

  getPosition() {
    return {
      x: this.diagram.bounds.x,
      y: this.diagram.bounds.y,
    };
  }

  getCenterPosition() {
    const { x, y } = this.getPosition();
    const { width, height } = this.getSize();
    const rectangle = new g.Rect(x, y, width, height);

    return rectangle.center();
  }

  setCenterOnPoint({ x, y }) {
    const { width, height } = this.getSize();

    this.setPosition({
      x: x - (width / 2),
      y: y - (height / 2),
    });
  }

  static BpmnTypes = {
    boundaryEvent: 'bpmn:BoundaryEvent',
    pool: 'bpmn:Participant',
    exclusiveGateway: 'bpmn:ExclusiveGateway',
    inclusiveGateway: 'bpmn:InclusiveGateway',
  }
}
