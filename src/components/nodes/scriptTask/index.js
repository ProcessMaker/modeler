import component from './scriptTask.vue';

export const taskHeight = 76;

export default {
  id: 'processmaker-modeler-script-task',
  component,
  bpmnType: 'bpmn:ScriptTask',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/scriptTask.svg'),
  label: 'Script Task',
  definition(moddle) {
    return moddle.create('bpmn:ScriptTask', {
      name: 'New Script Task',
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
          component: 'FormText',
          config: {
            label: 'Script Task',
            fontSize: '2em',
          },
        },
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
            helper: 'The name of the script task',
            name: 'name',
          },
        },
      ],
    },
  ],
};
