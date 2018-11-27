import component from './task.vue';

export const taskHeight = 80;

export default {
  id: 'processmaker-modeler-task',
  component,
  bpmnType: 'bpmn:Task',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/task.svg'),
  label: 'Task',
  definition(moddle) {
    return moddle.create('bpmn:Task', {
      name: 'New Task',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: taskHeight,
        width: 100,
      }),
    });
  },
  inspectorHandler(value, definition, component) {
    // Go through each property and rebind it to our data
    for (var key in value) {
      // Only change if the value is different
      if (definition[key] != value[key]) {
        definition[key] = value[key];
      }
    }
    component.updateShape();
  },
  inspectorConfig: [
    {
      name: 'Task',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Task',
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
            helper: 'The Name of the Task',
            name: 'name',
          },
        },
      ],
    },
  ],
};
