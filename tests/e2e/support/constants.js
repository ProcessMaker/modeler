/* 1366x768 is the most common desktop screen resolution according to the following sources:
 * https://www.w3schools.com/browsers/browsers_display.asp
 * http://gs.statcounter.com/screen-resolution-stats/desktop/worldwide
 */
export const defaultViewportDimensions = {
  width: 1366,
  height: 768,
};

export const nodeTypes = [
  'processmaker-modeler-task',
  'processmaker-modeler-end-event',
  'processmaker-modeler-script-task',
  'processmaker-modeler-exclusive-gateway',
  'processmaker-modeler-parallel-gateway',
  'processmaker-modeler-text-annotation',
  'processmaker-modeler-pool',
];

export const generateXML = (nodeName) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="node_2" name="${nodeName}" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
        <dc:Bounds x="150" y="150" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
};
