import BpmnModdle from 'bpmn-moddle'

let moddle = new BpmnModdle()

import component from './exclusiveGateway.vue'

export default {
    id: 'processmaker-modeler-exclusive-gateway',
    component: component,
    bpmnType: 'bpmn:ExclusiveGateway',
    control: true,
    category: 'BPMN',
    icon: require('../../../assets/toolpanel/exclusive-gateway.svg'),
    label: 'Exclusive Gateway',
    definition: function () {
        return moddle.create('bpmn:ExclusiveGateway', {
            name: 'New Exclusive Gateway',
            gatewayDirection: 'Diverging'
        })
    },
    diagram: function () {
        return moddle.create('bpmndi:BPMNShape', {
            bounds: moddle.create('dc:Bounds', {
                height: 42,
                width: 42
            })
        })
    },
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
            name: "Exclusive Gateway",
            items: [
                {
                    component: "FormText",
                    config: {
                        label: "Exclusive Gateway",
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
                        helper: "The Name of the Gateway",
                        name: "name"
                    }
                },
                {
                    component: "FormSelect",
                    config: {
                        label: "Direction",
                        helper: "The direction of the gateway",
                        name: "gatewayDirection",
                        options: [
                            {
                                value: "Diverging",
                                content: "Diverging"
                            },
                            {
                                value: "Converging",
                                content: "Converging"
                            }
                        ]
                    }
                }
            ]
        }
    ],

}