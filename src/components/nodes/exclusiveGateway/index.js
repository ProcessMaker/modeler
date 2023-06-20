import component from './exclusiveGateway.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/gateway/defaultNames';

const id = 'processmaker-modeler-exclusive-gateway';

export default {
  id,
  component,
  bpmnType: 'bpmn:ExclusiveGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/generic-gateway.svg'),
  label: 'Gateway',
  rank: 50,
  items: [
    {
      icon: require('@/assets/toolpanel/exclusive-gateway.svg'),
      label: 'Exclusive Gateway',
      control: true,
      rank: 51,
      id: 'processmaker-modeler-exclusive-gateway',
    },
    {
      icon: require('@/assets/toolpanel/inclusive-gateway.svg'),
      label: 'Inclusive Gateway',
      control: true,
      rank: 52,
      id: 'processmaker-modeler-inclusive-gateway',
    },
    {
      icon: require('@/assets/toolpanel/parallel-gateway.svg'),
      label: 'Parallel Gateway',
      control: true,
      rank: 53,
      id: 'processmaker-modeler-parallel-gateway',
    },
    {
      icon: require('@/assets/toolpanel/event-based-gateway.svg'),
      label: 'Event Based Gateway',
      control: true,
      rank: 54,
      id: 'processmaker-modeler-event-based-gateway',
    },
  ],
  definition(moddle, $t) {
    return moddle.create('bpmn:ExclusiveGateway', {
      name: $t(defaultNames[id]),
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
      name: defaultNames[id],
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-exlcusive-gateway',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
};
