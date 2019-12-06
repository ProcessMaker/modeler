import component from './task.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { taskHeight, taskWidth } from './taskConfig';

export const id = 'processmaker-modeler-task';

export default {
  id: 'processmaker-modeler-task',
  component,
  bpmnType: ['bpmn:Task', 'bpmn:UserTask', 'bpmn:GlobalTask', 'bpmn:SubProcess'],
  control: true,
  category: 'BPMN',
  rank: 4,
  icon: require('@/assets/toolpanel/task.svg'),
  label: 'Task',
  definition(moddle, $t) {
    return moddle.create('bpmn:Task', {
      name: $t('Task'),
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: taskHeight,
        width: taskWidth,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Task',
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
                ...nameConfigSettings,
                helper: 'The Name of the Task',
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
