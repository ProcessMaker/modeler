import component from './messageFlow.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import { getNodeIdGenerator } from '@/NodeIdGenerator';
import MessageFlow from '@/components/nodes/genericFlow/MessageFlow';

import { id } from '@/components/nodes/messageFlow/config';

export default {
  id,
  component,
  bpmnType: 'bpmn:MessageFlow',
  control: false,
  definition(moddle) {
    return moddle.create('bpmn:MessageFlow', {
      name: '',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNEdge');
  },
  inspectorConfig: [
    {
      name: 'Message Flow',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-message-flow',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
  async multiplayerClient(modeler, data) {
    const { paper } = modeler;
    const sourceElem = modeler.getElementByNodeId( data.sourceRefId);
    const targetElem = modeler.getElementByNodeId( data.targetRefId);
    if (sourceElem && targetElem) {
      const flow = new MessageFlow(modeler.nodeRegistry, modeler.moddle, paper);
      const actualFlow = flow.makeFlowNode(sourceElem, targetElem, data.waypoint);
      // add Nodes
      modeler.addNode(actualFlow, data.id, true);
      const nodeIdereator = getNodeIdGenerator(modeler.definitions);
      nodeIdereator.updateCounters();
    }
  },
};
