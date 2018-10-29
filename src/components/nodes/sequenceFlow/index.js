import component from './sequenceFlow.vue'

export default {
    id: 'processmaker-modeler-sequence-flow',
    component: component,
    bpmnType: 'bpmn:SequenceFlow',
    control: false,
    inspectorHandler: function (value, definition, component) {
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
            name: "Task",
            items: [
                {
                    component: "FormText",
                    config: {
                        label: "Task",
                        fontSize: "2em"
                    }
                },
                {
                    component: "FormInput",
                    config: {
                        label: "Identifier",
                        helper:
                            "The id field should be unique across all elements in the diagram",
                        name: "id"
                    }
                },
                {
                    component: "FormInput",
                    config: {
                        label: "Name",
                        helper: "The Name of the Task",
                        name: "name"
                    }
                }
            ]
        }
    ]
}
