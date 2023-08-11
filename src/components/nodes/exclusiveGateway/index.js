import component from './exclusiveGateway.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/gateway/defaultNames';
import icon from '@/assets/toolpanel/generic-gateway.svg?url';
import exclusiveGatewayIcon from '@/assets/toolpanel/exclusive-gateway.svg?url';
import inclusiveGatewayIcon from '@/assets/toolpanel/inclusive-gateway.svg?url';
import parallelGatewayIcon from '@/assets/toolpanel/parallel-gateway.svg?url';
import eventBasedGatewayIcon from '@/assets/toolpanel/event-based-gateway.svg?url';

const id = 'processmaker-modeler-exclusive-gateway';

export default {
  id,
  component,
  bpmnType: 'bpmn:ExclusiveGateway',
  control: true,
  category: 'BPMN',
  icon,
  label: 'Gateway',
  rank: 50,
  items: [
    {
      icon: exclusiveGatewayIcon,
      label: 'Exclusive Gateway',
      control: true,
      rank: 51,
      id: 'processmaker-modeler-exclusive-gateway',
    },
    {
      icon: inclusiveGatewayIcon,
      label: 'Inclusive Gateway',
      control: true,
      rank: 52,
      id: 'processmaker-modeler-inclusive-gateway',
    },
    {
      icon: parallelGatewayIcon,
      label: 'Parallel Gateway',
      control: true,
      rank: 53,
      id: 'processmaker-modeler-parallel-gateway',
    },
    {
      icon: eventBasedGatewayIcon,
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
