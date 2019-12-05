import component from './scriptTask.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';

export const taskHeight = 76;
export const id = 'processmaker-modeler-script-task';
export default {
  id,
  component,
  bpmnType: 'bpmn:ScriptTask',
  control: false,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/scriptTask.svg'),
  label: 'Script Task',
  definition(moddle, $t) {
    return moddle.create('bpmn:ScriptTask', {
      name: $t('New Script Task'),
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
      name: 'ScriptTask',
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
                helper: 'The Name of the Script Task',
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
