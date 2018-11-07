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
    // Go through each property and rebind it to our data
    for (var key in value) {
      // Only change if the value is different
      if (definition[key] != value[key]) {
        definition[key] = value[key];
        definition.set('name', value.name);
        definition.conditionExpression.set('body', value.body);
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
