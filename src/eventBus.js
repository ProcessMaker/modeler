import Vue from 'vue';

/* Expression example */
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker.json';

/* Our initial node types to register with our modeler */
import {
  association,
  endEvent,
  exclusiveGateway,
  inclusiveGateway,
  parallelGateway,
  sequenceFlow,
  startEvent,
  task,
  textAnnotation,
  pool,
  poolLane,
} from './components/nodes';

const nodeTypes = [
  startEvent,
  endEvent,
  task,
  exclusiveGateway,
  inclusiveGateway,
  parallelGateway,
  sequenceFlow,
  textAnnotation,
  association,
  pool,
  poolLane,
];

const blank = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="2.0.3">
  <bpmn:process id="Process_1" isExecutable="true"></bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"></bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

window.ProcessMaker = { EventBus: new Vue() };

window.ProcessMaker.EventBus.$on('modeler-init', modeler => {
  /* Register basic node types */
  for (const node of nodeTypes) {
    modeler.registerNode(node);
  }

  /* Add a BPMN extension */
  modeler.registerBpmnExtension('pm', bpmnExtension);

  /* Add custom properties to inspector */
  modeler.registerInspectorExtension(task, {
    id: 'pm-due-in',
    component: 'FormInput',
    config: {
      type: 'number',
      label: 'Due In',
      placeholder: '72 hours',
      helper: 'Time when the task will due (hours)',
      name: 'dueIn',
    },
  });

  /* Add a custom node example */
  const component = {
    extends: task.component,
    methods: {
      handleClick () {
        this.$parent.loadInspector('processmaker-connectors-social-twitter-send', this.node.definition, this);
      },
    },
  };
  const nodeType = {
    id: 'processmaker-connectors-social-twitter-send',
    component: component,
    bpmnType: 'bpmn:ServiceTask',
    control: true,
    category: 'Social',
    icon: require('./assets/toolpanel/task.svg'),
    label: 'Send Tweet',
    definition: function(moddle) {
      return moddle.create('bpmn:ServiceTask', {
        name: 'Send Tweet',
        implementation: 'processmaker-social-twitter-send',
      });
    },
    diagram: function(moddle) {
      return moddle.create('bpmndi:BPMNShape', {
        bounds: moddle.create('dc:Bounds', {
          height: 80,
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
        name: 'Send Tweet',
        items: [
          {
            component: 'FormText',
            config: {
              label: 'Send Tweet',
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
            component: 'FormTextArea',
            config: {
              label: 'Tweet Body',
              helper: 'The Body Of The Tweet to Send',
              name: 'tweet',
            },
          },
        ],
      },
    ],
  };
  modeler.registerNodeType(nodeType);
});

window.ProcessMaker.EventBus.$on('modeler-start', modeler => {
  modeler.loadXML(blank);
});

window.ProcessMaker.EventBus.$on('modeler-start', async () => {
  const { data: users } = await window.ProcessMaker.apiClient.get('/user');

  /* Add custom properties to inspector */
  task.inspectorConfig[0].items.push({
    component: 'FormInput',
    config: {
      type: 'number',
      label: 'Due In',
      placeholder: '72 hours',
      helper: 'Time when the task will due (hours)',
      name: 'dueIn',
    },
  }, {
    component: 'FormSelect',
    config: {
      label: 'Direction',
      helper: 'The direction of the gateway',
      name: 'gatewayDirection',
      options: users.map(user => ({ value: user.id, content: `${user.firstname} ${user.lastname}` })),
    },
  });
});
