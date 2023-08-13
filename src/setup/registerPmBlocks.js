import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker';

const nodeTypes = window.ProcessMaker.pmBlockNodes;

export default function registerPmBlocks({ registerPmBlock, registerBpmnExtension }) {
  console.log('REGISTER PM BLOCK', nodeTypes);
  nodeTypes.forEach(config => registerPmBlock(config));
  
  registerBpmnExtension('pm', bpmnExtension);
}
