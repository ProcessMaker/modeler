import component from './poolLane';

export const id = 'processmaker-modeler-lane';
export const minLaneHeight = 100;

export default {
  id,
  component,
  bpmnType: 'bpmn:Lane',
  control: false,
  category: 'BPMN',
  label: 'New Lane',
  definition: (moddle) => moddle.create('bpmn:Lane', { name: '' }),
  diagram: (moddle) => moddle.create('bpmndi:BPMNShape', {
    bounds: moddle.create('dc:Bounds', {
      height: 150,
      width: 600,
      x: null,
      y: null,
    }),
  }),
  inspectorConfig: [
    {
      name: 'Lane',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'confifuration',
          },
          items: [
            {
              component: 'FormInput',
              config: {
                label: 'Identifier',
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'id',
                validation: ['required', 'regex:/^[a-zA-Z][^\\s][a-zA-Z0-9_]+$/'],
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
    },
  ],
};
