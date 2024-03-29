import component from './sequenceFlow.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import { getNodeIdGenerator } from '@/NodeIdGenerator';
import SequenceFlow from '@/components/nodes/genericFlow/SequenceFlow';

export const id = 'processmaker-modeler-sequence-flow';

export default {
  id,
  component,
  bpmnType: 'bpmn:SequenceFlow',
  control: false,
  definition(moddle) {
    return moddle.create('bpmn:SequenceFlow', {
      name: null,
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNEdge');
  },
  inspectorData(node) {
    // If the flow's source is doesn't have condition remove it:
    const hasCondition = ['bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway'].includes(node.definition.sourceRef.$type);
    if (!hasCondition) {
      delete node.definition.conditionExpression;
    }
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'conditionExpression') {
        data[key] = value.body;
      } else {
        data[key] = value;
      }

      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp, moddle) {
    const definition = node.definition;

    // Exclusive and inclusive gateways could have conditioned flows
    const hasCondition = ['bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway'].includes(definition.sourceRef.$type);

    // Go through each property and rebind it to our data
    for (const key in value) {
      if (definition[key] === value[key]) {
        continue;
      }

      if (key === 'conditionExpression' && hasCondition) {
        // Set the condition expression IFF the expresion body changed
        if (definition[key].body !== value[key]) {
          const conditionExpression = moddle.create('bpmn:FormalExpression', { body: value[key] });
          window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
            id: node.definition.id , key, value: [conditionExpression],
          });
          setNodeProp(node, key, conditionExpression);
        }
      } else {
        window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
          id: node.definition.id , key, value: value[key],
        });
        setNodeProp(node, key, value[key]);
      }
    }
  },
  multiplayerInspectorHandler(node, data, setNodeProp, moddle) {
    const keys = Object.keys(data).filter((key) => key !== 'id');
    if (keys.length === 0) {
      return;
    }
    if (keys[0] === 'conditionExpression') {
      const conditionExpression = moddle.create('bpmn:FormalExpression', { body: data[keys[0]][0].body });
      setNodeProp(node, keys[0], conditionExpression);
      return;
    }
    setNodeProp(node, keys[0], data[keys[0]]);
  },
  inspectorConfig: [
    {
      name: 'Sequence Flow',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-sequence-flow',
          },
          items: [
            {
              component: 'FormInput',
              config: { ...nameConfigSettings, validation: null },
            },
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
  async multiplayerClient(modeler, data) {
    const { paper } = modeler;
    const sourceElem = modeler.getElementByNodeId(data.sourceRefId);
    const targetElem = modeler.getElementByNodeId(data.targetRefId);
    if (sourceElem && targetElem) {
      const flow = new SequenceFlow(modeler.nodeRegistry, modeler.moddle, paper);
      const actualFlow = flow.makeFlowNode(sourceElem, targetElem, data.waypoint);
      // add Nodes
      modeler.addNode(actualFlow, data.id, true);
      const nodeIdereator = getNodeIdGenerator(modeler.definitions);
      nodeIdereator.updateCounters();
    }
  },
};
