import component from './pool';

export const id = 'processmaker-modeler-pool';
export const labelWidth = 30;
export const poolPadding = 20;

export default {
  id,
  component,
  bpmnType: 'bpmn:Participant',
  control: false,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/pool.svg'),
  label: 'Pool',
  definition(moddle) {
    return moddle.create('bpmn:Participant', {
      name: 'New Pool',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 250,
        width: 600,
      }),
    });
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
