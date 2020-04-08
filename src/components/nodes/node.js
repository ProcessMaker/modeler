import {
  defaultEndNames,
  defaultGatewayNames,
  defaultIntermediateNames,
  defaultStartNames,
  defaultTaskNames,
} from '@/components/nodes/defaultNames';

export default class Node {
  static diagramPropertiesToCopy = ['x', 'y', 'width', 'height'];
  static definitionPropertiesToNotCopy = ['$type', 'id'];

  type;
  definition;
  diagram;
  pool;

  constructor(type, definition, diagram) {
    this.type = type;
    this.definition = definition;
    this.diagram = diagram;
  }

  isBpmnType(...types) {
    return types.includes(this.definition.$type);
  }

  canBeDefaultFlow() {
    const validSources = [
      'bpmn:ExclusiveGateway',
      'bpmn:InclusiveGateway',
    ];
    return this.definition.$type === 'bpmn:SequenceFlow'
      && validSources.indexOf(this.definition.sourceRef.$type) > -1;
  }

  isType(type) {
    return this.type === type;
  }

  isStartEvent() {
    return Object.keys(defaultStartNames).includes(this.type);
  }

  isEndEvent() {
    return Object.keys(defaultEndNames).includes(this.type);
  }

  isTask() {
    return Object.keys(defaultTaskNames).includes(this.type);
  }

  isGateway() {
    return Object.keys(defaultGatewayNames).includes(this.type);
  }

  isIntermediateEvent() {
    return Object.keys(defaultIntermediateNames).includes(this.type);
  }

  get id() {
    return this.definition.id;
  }

  set id(id) {
    this.definition.id = id;
  }

  setIds(nodeIdGenerator) {
    const [nodeId, diagramId] = nodeIdGenerator.generate();

    if (!this.id) {
      this.id = nodeId;
    }

    if (this.diagram) {
      this.diagram.id = diagramId;
      this.diagram.bpmnElement = this.definition;
    }
  }

  clone(nodeRegistry, moddle, $t) {
    const definition = nodeRegistry[this.type].definition(moddle, $t);
    const diagram = nodeRegistry[this.type].diagram(moddle);
    const clonedNode = new this.constructor(this.type, definition, diagram);

    clonedNode.id = null;
    Node.diagramPropertiesToCopy.forEach(prop => clonedNode.diagram.bounds[prop] = this.diagram.bounds[prop]);
    Object.keys(this.definition).filter(key => !Node.definitionPropertiesToNotCopy.includes(key)).forEach(key => {
      clonedNode.definition.set(key, this.definition.get(key));
    });

    return clonedNode;
  }

  getTargetProcess(processes, processNode) {
    return this.pool
      ? processes.find(({ id }) => id === this.pool.component.node.definition.get('processRef').id)
      : processNode.definition;
  }

  static isTimerType(type) {
    return [
      'processmaker-modeler-start-timer-event',
      'processmaker-modeler-intermediate-catch-timer-event',
    ].includes(type);
  }
}
