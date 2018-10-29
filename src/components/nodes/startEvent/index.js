import BpmnModdle from 'bpmn-moddle'

let moddle = new BpmnModdle()

import component from './startEvent.vue'

export default {
    id: 'processmaker-modeler-start-event',
    component: component,
    bpmnType: 'bpmn:StartEvent',
    control: true,
    category: 'BPMN',
    icon: require('../../../assets/toolpanel/start-event.svg'),
    label: 'Start Event',
    definition: function () {
        return moddle.create('bpmn:StartEvent', {
            name: 'Start Event'
        })
    },
    diagram: function () {
      return moddle.create('bpmndi:BPMNShape', {
            bounds: moddle.create('dc:Bounds', {
                height: 36,
                width: 36,
                x: null,
                y: null
            })
        })
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
            name: "Start Event",
            items: [
                {
                    component: "FormText",
                    config: {
                        label: "Start Event",
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
                        helper: "The Name of the Start Event",
                        name: "name"
                    }
                }
            ]
        }
    ]
}