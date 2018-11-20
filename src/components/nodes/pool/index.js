import component from './pool';

export const id = 'processmaker-modeler-pool';
export const labelWidth = 30;
export const poolPadding = 20;

export default {
  id,
  component,
  bpmnType: 'bpmn:Participant',
  control: true,
  category: 'BPMN',
  icon: require('../../../assets/toolpanel/pool.svg'),
  label: 'Pool',
  definition: function (moddle) {
    return moddle.create('bpmn:Participant', {
      name: 'New Pool',
    });
  },
  diagram: function (moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 250,
        width: 600,
      }),
    });
  },
  inspectorHandler(value, definition, component) {
    // Go through each property and rebind it to our data
    for (const key in value) {
      // Only change if the value is different
      if (definition[key] != value[key]) {
        definition[key] = value[key];
      }
    }

    component.updateShape();
  },
  inspectorConfig: [
    {
      name: 'Pool',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Pool',
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
            helper: 'The Name of the Pool',
            name: 'name',
          },
        },
      ],
    },
  ],
};
