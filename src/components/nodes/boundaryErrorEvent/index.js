import component from './boundaryErrorEvent.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

export default {
  id: 'processmaker-modeler-boundary-error-event',
  component,
  bpmnType: 'bpmn:BoundaryEvent',
  control: false,
  category: 'BPMN',
  label: 'Boundary Error Event',
  icon: require('@/assets/toolpanel/boundary-error-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('New Boundary Timer Event'),
      attachedToRef: '',
      eventDefinitions: [
        moddle.create('bpmn:ErrorEventDefinition', {
          id: null,
        }),
      ],
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
      name: 'Boundary Event',
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
              config: idConfigSettings,
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The Name of the Boundary Timer Event',
                name: 'name',
              },
            },
          ],
        },
      ],
    },
  ],
};
