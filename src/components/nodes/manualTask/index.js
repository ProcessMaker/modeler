import component from './manualTask.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';

export const taskHeight = 76;
export const id = 'processmaker-modeler-manual-task';

export default {
  id,
  component,
  bpmnType: 'bpmn:ManualTask',
  control: false,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/manualTask.svg'),
  label: 'Manual Task',
  definition(moddle, $t) {
    return moddle.create('bpmn:ManualTask', {
      name: $t('Manual Task'),
      documentation: [moddle.create('bpmn:Documentation', { text: '' })],
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: taskHeight,
        width: 116,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'ManualTask',
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
