// Initial list of BPMN controls
import BpmnModdle from 'bpmn-moddle'

let moddle = new BpmnModdle;

export default {
    "BPMN": [
        {
            icon: require('./assets/toolpanel/task.svg'),
            label: 'Task',
            component: require('./components/nodes/task'),
            type: 'task',
            definition: function () {
                return moddle.create('bpmn:Task', {
                    name: 'New Task'
                })
            },
            diagram: function () {
                return moddle.create('bpmndi:BPMNShape', {
                    bounds: moddle.create('dc:Bounds', {
                        height: 80,
                        width: 100,
                        x: null,
                        y: null
                    })
                })
            },
        },
        {
            icon: require('./assets/toolpanel/exclusive-gateway.svg'),
            label: 'Exclusive Gateway',
            component: require('./components/nodes/task')
        },
        {
            icon: require('./assets/toolpanel/parallel-gateway.svg'),
            label: 'Parallel Gateway',
            component: require('./components/nodes/task')
        },
        {
            icon: require('./assets/toolpanel/inclusive-gateway.svg'),
            label: 'Inclusive Gateway',
            component: require('./components/nodes/task')
        },
        {
            icon: require('./assets/toolpanel/start-event.svg'),
            label: 'Start Event',
            component: require('./components/nodes/startEvent'),
            type: 'startEvent',
            definition: function () {
                return moddle.create('bpmn:StartEvent', {
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

        },
        {
            icon: require('./assets/toolpanel/intermediate-mail-event.svg'),
            label: 'Intermediate Mail Event',
            component: require('./components/nodes/task')
        },
        {
            icon: require('./assets/toolpanel/end-event.svg'),
            label: 'End Event',
            component: require('./components/nodes/endEvent')
        },
        {
            icon: require('./assets/toolpanel/end-email-event.svg'),
            label: 'End Email Event',
            component: require('./components/nodes/task')
        },
        {
            icon: require('./assets/toolpanel/pool.svg'),
            label: 'Pool',
            component: require('./components/nodes/task')
        },
        {
            icon: require('./assets/toolpanel/lane.svg'),
            label: 'Lane',
            component: require('./components/nodes/task')
        },
        {
            icon: require('./assets/toolpanel/text-annotation.svg'),
            label: 'Text Annotation',
            component: require('./components/nodes/task')
        }
    ]
}
