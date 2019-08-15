import component from './startEvent.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';

export default {
  id: 'processmaker-modeler-start-event',
  component,
  bpmnType: 'bpmn:StartEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/start-event.svg'),
  label: 'Start Event',
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t('Start Event'),
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
   * Validate whether to accept an incoming flow from the node
   *
   * @param node
   */
  validateIncoming() {
    return false;
  },
  inspectorConfig: [
    {
      name: 'Start Event',
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
                helper: 'The Name of the Start Event',
              },
            },
          ],
        },
      ],
    },
  ],
};
