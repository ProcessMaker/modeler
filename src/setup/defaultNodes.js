/* Expression example */
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker.json';

/* Our initial node types to register with our modeler */
import * as nodeTypes from '@/components/nodes';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerNode, registerBpmnExtension })  => {
  /* Register basic node types */
  Object.values(nodeTypes).forEach(config => registerNode(config));

  /* Add a BPMN extension */
  registerBpmnExtension('pm', bpmnExtension);
});
