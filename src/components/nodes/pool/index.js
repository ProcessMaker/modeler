import component from './pool';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';

export const id = 'processmaker-modeler-pool';

export default {
  id,
  component,
  bpmnType: 'bpmn:Participant',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/pool.svg'),
  label: 'Pool',
  definition(moddle, $t) {
    return moddle.create('bpmn:Participant', {
      name: $t('Pool'),
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 300,
        width: 600,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Pool',
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
