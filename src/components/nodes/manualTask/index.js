import component from './manualTask.vue';
import i18next from 'i18next';

export const taskHeight = 76;

export default {
  id: 'processmaker-modeler-manual-task',
  component,
  bpmnType: 'bpmn:ManualTask',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/manualTask.svg'),
  label: 'Manual Task',
  definition(moddle) {
    return moddle.create('bpmn:ManualTask', {
      name: i18next.t('New Manual Task'),
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
            name: 'configuration',
          },
          items: [
            {
              component: 'FormInput',
              config: {
                label: 'Identifier',
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'id',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The name of the manual task',
                name: 'name',
              },
            },
          ],
        },
      ],
    },
  ],
};
