import component from './exclusiveGateway.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

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
            name: 'inspector-accordion',
          },
          items: [
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
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: false,
            label: 'Advanced',
            icon: 'cogs',
            name: 'inspector-accordion',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
          ],
        },
      ],
    },
  ],
};
