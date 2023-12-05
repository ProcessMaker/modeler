import { setEventTimerDefinition } from '@/components/nodes/boundaryTimerEvent';

export class InspectorUtils {
  constructor(modeler, store) {
    this.modeler = modeler;
    this.store = store;
  }

  isSpecialProperty(key) {
    const specialProperties = [
      'messageRef', 'signalRef', 'signalPayload', 'gatewayDirection', 'condition', 'allowedUsers', 'allowedGroups',
    ];
    return specialProperties.includes(key);
  }

  updateNodeId(oldNodeId, newId) {
    const index = this.getIndex(oldNodeId);
    const yNode = this.yArray.get(index);
    yNode.set('id', newId);
    const node = this.getNodeById(oldNodeId);
    this.store.commit('updateNodeProp', { node, key: 'id', value: newId });
  }

  handleLoopCharacteristics(node, loopCharacteristics) {
    const parsedLoopCharacteristics = JSON.parse(loopCharacteristics);
    this.modeler.nodeRegistry[node.type].loopCharacteristicsHandler({
      type: node.definition.type,
      '$loopCharactetistics': {
        id: node.id,
        loopCharacteristics: parsedLoopCharacteristics,
      },
    }, node, this.setNodeProp, this.modeler.moddle, this.modeler.definitions, false);
  }

  updateEventCondition(definition, value) {
    definition.get('eventDefinitions')[0].get('condition').body = value;
  }

  updateGatewayDirection(definition, value) {
    definition.set('gatewayDirection', value);
  }

  updateNodeProperty(node, key, value) {
    this.store.commit('updateNodeProp', { node, key, value });
  }

  updateMessageRef(node, value, extras) {
    let message = this.modeler.definitions.rootElements.find(element => element.id === value);

    if (!message) {
      message = this.modeler.moddle.create('bpmn:Message', {
        id: value,
        name: extras?.messageName || value,
      });
      this.modeler.definitions.rootElements.push(message);
    }

    node.definition.get('eventDefinitions')[0].messageRef = message;

    if (extras?.allowedUsers) {
      node.definition.set('allowedUsers', extras.allowedUsers);
    }

    if (extras?.allowedGroups) {
      node.definition.set('allowedGroups', extras.allowedGroups);
    }
  }

  updateSignalRef(node, value, extras) {
    let signal = this.modeler.definitions.rootElements.find(element => element.id === value);

    if (!signal) {
      signal = this.modeler.moddle.create('bpmn:Signal', {
        id: value,
        name: extras?.signalName || value,
      });
      this.modeler.definitions.rootElements.push(signal);
    }

    node.definition.get('eventDefinitions')[0].signalRef = signal;
  }

  updateSignalPayload(node, value) {
    const eventDefinitions = node.definition.get('eventDefinitions');
    const SIGNAL_EVENT_DEFINITION_TYPE = 'bpmn:SignalEventDefinition';

    eventDefinitions.forEach(definition => {
      if (definition.$type === SIGNAL_EVENT_DEFINITION_TYPE) {
        definition.config = value;
      }
    });
  }

  updateEventTimerDefinition(node, value) {
    const { type, body } = value;
    const eventDefinitions = setEventTimerDefinition(this.modeler.moddle, node, type, body);
    this.store.commit('updateNodeProp', { node, key: 'eventDefinitions', value: eventDefinitions });
  }
}
