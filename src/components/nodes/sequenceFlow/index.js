import BpmnModdle from 'bpmn-moddle';
import component from './sequenceFlow.vue';

let moddle = new BpmnModdle();

export default {
  id: 'processmaker-modeler-sequence-flow',
  component: component,
  bpmnType: 'bpmn:SequenceFlow',
  control: false,
  definition: function() {
    let sequenceFlow = moddle.create('bpmn:SequenceFlow', {
      name: 'New Sequence Flow',
    });
    sequenceFlow.conditionExpression = moddle.create('bpmn:FormalExpression', {
      body: 'Expression',
    });

    return sequenceFlow.conditionExpression;
  },
  inspectorHandler: function(value, definition, component) {
    // Exclusive and inclusive gateways could have conditioned flows
    const hasCondition = definition.sourceRef.$type === 'bpmn:ExclusiveGateway'
        || definition.sourceRef.$type === 'bpmn:InclusiveGateway';
    // Go through each property and rebind it to our data
    for (var key in value) {
      let isDirty = definition[key] != value[key];
      if (isDirty && hasCondition && key === 'conditionExpression') {
        // Set the condition expression
        definition.conditionExpression = definition.conditionExpression.set instanceof Function
          ? definition.conditionExpression : component.$parent.moddle.create('bpmn:FormalExpression', {
            body: value[key].body,
          });
        definition.conditionExpression.set('body', value[key].body);
      } else if (isDirty) {
        definition[key] = value[key];
      }
    }
    component.updateShape();
  },
  inspectorConfig: [
    {
      name: 'Sequence Flow',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Sequence Flow',
            fontSize: '2em',
          },
        },
        {
          component: 'FormInput',
          config: {
            label: 'Identifier',
            helper: 'The id field should be unique across all elements in the diagram',
            name: 'id',
          },
        },
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
  ],
};
