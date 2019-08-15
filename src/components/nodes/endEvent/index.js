import component from './endEvent.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';

export default {
  id: 'processmaker-modeler-end-event',
  component,
  bpmnType: 'bpmn:EndEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/end-event.svg'),
  label: 'End Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
      name: $t('End Event'),
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
        x: null,
        y: null,
      }),
    });
  },
  /**
   * Validate whether to accept an outgoing flow to the node
   *
   * @param node
   */
  validateOutgoing() {
    return false;
  },
  inspectorConfig: [
    {
      name: 'End Event',
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
                helper: 'The Name of the End Event',
              },
            },
          ],
        },
      ],
    },
  ],
};
