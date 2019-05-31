import component from './pool';

export const id = 'processmaker-modeler-pool';

export default {
  id,
  component,
  bpmnType: 'bpmn:Participant',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/pool.svg'),
  label: 'Pool',
  definition(moddle, $t) {
    return moddle.create('bpmn:Participant', {
      name: $t('New Pool'),
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 300,
        width: 600,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Pool',
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
    },
  ],
};
