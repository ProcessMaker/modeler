import component from './eventBasedGateway.vue';

export default {
  id: 'processmaker-modeler-event-based-gateway',
  component,
  bpmnType: 'bpmn:EventBasedGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/inclusive-gateway.svg'),
  label: 'Inclusive Gateway',
  definition(moddle) {
    return moddle.create('bpmn:EventBasedGateway', {
      name: '',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Event-based Gateway',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Event-based Gateway',
            fontSize: '2em',
          },
        },
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
                helper: 'The Name of the Gateway',
                name: 'name',
              },
            },
          ],
        },
      ],
    },
  ],
};
