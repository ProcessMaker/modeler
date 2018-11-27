import component from './scriptTask.vue';

export const taskHeight = 80;

export default {
  id: 'processmaker-modeler-script-task',
  component: component,
  bpmnType: 'bpmn:ScriptTask',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/scriptTask.svg'),
  label: 'Script Task',
  definition: function(moddle) {
    return moddle.create('bpmn:ScriptTask', {
      name: 'New Script Task',
    });
  },
  diagram: function(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: taskHeight,
        width: 100,
      }),
    });
  },
  inspectorHandler: function(value, definition, component) {
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
      name: 'ScriptTask',
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
