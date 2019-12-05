import component from './sequenceFlow.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

export const id = 'processmaker-modeler-sequence-flow';

export default {
  id,
  component,
  bpmnType: 'bpmn:SequenceFlow',
  control: false,
  definition(moddle, $t) {
    return moddle.create('bpmn:SequenceFlow', {
      name: $t('New Sequence Flow'),
      startEvent: '',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNEdge');
  },
  inspectorData(node) {
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
        // Set the condition expression
        const conditionExpression = moddle.create('bpmn:FormalExpression', { body: value[key] });
        setNodeProp(node, 'conditionExpression', conditionExpression);
      } else {
        setNodeProp(node, key, value[key]);
      }
    }
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
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion',
          },
          items: [
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The Name of the Sequence Flow',
                name: 'name',
              },
            },
          ],
        },
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: false,
            label: 'Advanced',
            icon: 'cogs',
            name: 'inspector-accordion',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
          ],
        },
      ],
    },
  ],
};
