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
            label: 'Configuration',
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
