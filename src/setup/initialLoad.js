import './globals';
// Import Extensions for Testing Modeler
import './extensions/testTaskInspectorExtension';
import './extensions/twitterConnector';
import './extensions/testCustomConnector';
import './extensions/customMarker';
import registerNodes from '@/setup/registerNodes';

const blank = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:pm="http://processmaker.com/BPMN/2.0/Schema.xsd" xmlns:tns="http://sourceforge.net/bpmn/definitions/_1530553328908" xmlns:xsd="http://www.w3.org/2001/XMLSchema" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL http://bpmn.sourceforge.net/schemas/BPMN20.xsd">
<bpmn:process id="ProcessId" name="ProcessName" isExecutable="true">
<bpmn:task id="node_29" name="Form Task" pm:allowInterstitial="false" pm:assignment="requester" pm:assignmentLock="false" pm:allowReassignment="false"/>
</bpmn:process>
<bpmndi:BPMNDiagram id="BPMNDiagramId">
<bpmndi:BPMNPlane id="BPMNPlaneId" bpmnElement="ProcessId">
<bpmndi:BPMNShape id="node_29_di" bpmnElement="node_29">
<dc:Bounds x="70" y="210" width="116" height="76"/>
</bpmndi:BPMNShape>
</bpmndi:BPMNPlane>
</bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

window.ProcessMaker.EventBus.$on('modeler-init', registerNodes);
window.ProcessMaker.EventBus.$on('modeler-start', ({ loadXML }) => {
  loadXML(blank);
});



window.ProcessMaker.EventBus.$on(
  'modeler-init',
  (event) => {
    event.registerPreview({
      url: '/designer/screens/preview',
      assetUrl: (nodeData) => `/designer/screen-builder/${nodeData.screenRef}/edit`,
      receivingParams: ['screenRef'],
      matcher: (nodeData) => nodeData?.$type  === 'bpmn:Task',
    });

    event.registerPreview({
      url: '/designer/scripts/preview',
      assetUrl: (nodeData) => `/designer/scripts/${nodeData.scriptRef}/builder`,
      receivingParams: ['scriptRef'],
      matcher: (nodeData) => nodeData?.$type === 'bpmn:ScriptTask',
    });

    event.registerPreview({
      url: '/designer/scripts/preview',
      assetUrl: (nodeData) => `/designer/screen-builder/${nodeData.screenRef}/edit`,
      receivingParams: ['screenRef'],
      matcher: (nodeData) => nodeData?.$type === 'bpmn:ManualTask',
    });
  });

