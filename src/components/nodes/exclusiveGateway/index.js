import component from './exclusiveGateway.vue';
import { configId } from '@/components/inspectors/configId';

export default {
  id: 'processmaker-modeler-exclusive-gateway',
  component,
  bpmnType: 'bpmn:ExclusiveGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/exclusive-gateway.svg'),
  label: 'Exclusive Gateway',
  definition(moddle, $t) {
    return moddle.create('bpmn:ExclusiveGateway', {
      name: $t('New Exclusive Gateway'),
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
      name: 'Exclusive Gateway',
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
              config: {
                label: 'Identifier',
                helper: configId.helper,
                name: configId.id,
                validation: configId.validation,
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
