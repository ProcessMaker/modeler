import BpmnModdle from 'bpmn-moddle';
import component from './poolLane';

const moddle = new BpmnModdle();

export const id = 'processmaker-modeler-lane';

export default {
  id,
  component,
  bpmnType: 'bpmn:Lane',
  control: false,
  category: 'BPMN',
  label: 'New Lane',
  definition: () => moddle.create('bpmn:Lane', { name: '' }),
  diagram: () => moddle.create('bpmndi:BPMNShape', {
    bounds: moddle.create('dc:Bounds', {
      height: 150,
      width: 600,
    }),
  }),
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
      name: 'Lane',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Lane',
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
            helper: 'The Name of the Lane',
            name: 'name',
          },
        },
      ],
    },
  ],
};
