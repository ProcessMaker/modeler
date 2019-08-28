import component from './boundarySignalEvent';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';

export default {
  id: 'processmaker-modeler-boundary-signal-event',
  component,
  bpmnType: 'bpmn:BoundaryEvent',
  control: false,
  category: 'BPMN',
  label: 'Boundary Signal Event',
  icon: require('@/assets/toolpanel/boundary-signal-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('New Boundary Timer Event'),
      eventDefinitions: [
        moddle.create('bpmn:SignalEventDefinition', {
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
            name: 'configuration',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
            {
              component: 'FormInput',
              config: {
                ...nameConfigSettings,
                helper: 'The Name of the Boundary Timer Event',
              },
            },
          ],
        },
      ],
    },
  ],
};
