import component from './boundaryEvent.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';

export default {
  id: 'processmaker-modeler-boundary-event',
  component,
  bpmnType: 'bpmn:BoundaryEvent',
  control: true,
  category: 'BPMN',
  label: 'Boundary Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('New Boundary Event'),
      cancelActivity: true,
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
                ...nameConfigSettings,
                helper: 'The Name of the Boundary Event',
              },
            },
            {
              component: 'FormCheckbox',
              config: {
                label: 'Interrupting',
                name: 'cancelActivity',
                helper: 'Boundary Event Type',
              },
            },
            {
              component: 'FormSelect',
              config: {
                label: 'Boundary Type',
                helper: 'Select Boundary Type',
                name: 'boundaryType',
                options: [
                  { value: 'Message Event', content: 'Message Event' },
                  { value: 'Timer Event', content: 'Timer Event' },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
