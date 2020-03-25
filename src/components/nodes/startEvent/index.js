import component from './startEvent.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { startEventDiameter } from './startEventConfig';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import defaultNames from './defaultNames';

const id = 'processmaker-modeler-start-event';

export default {
  id,
  component,
  bpmnType: 'bpmn:StartEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/start-event.svg'),
  label: defaultNames[id],
  rank: 1,
  definition(moddle, $t) {
    return moddle.create('bpmn:StartEvent', {
      name: $t(defaultNames[id]),
      group: 'StartEvent',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: startEventDiameter,
        width: startEventDiameter,
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
      name: defaultNames[id],
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        advancedAccordionConfig,
      ],
    },
  ],
};
