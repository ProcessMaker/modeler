import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker';

const nodeTypes = window.ProcessMaker.pmBlockNodes;

export default function registerPmBlock({ registerPmBlock, registerBpmnExtension }) {
  nodeTypes.forEach(config => registerPmBlock(config));

  registerBpmnExtension('pm', bpmnExtension);
}
