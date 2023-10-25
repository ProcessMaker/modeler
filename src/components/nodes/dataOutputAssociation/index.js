import component from './dataOutputAssociation.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import * as config from './config';
import { getNodeIdGenerator } from '@/NodeIdGenerator';
import DataOutputAssociation from '../genericFlow/DataOutputAssociation';

export default {
  ...config,
  component,
  control: false,
  inspectorConfig: [
    {
      name: 'Data Output Association',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-data-output-association',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
          ],
        },
      ],
    },
  ],
  async multiplayerClient(modeler, data) {
    const { paper } = modeler;
    const sourceElem = modeler.getElementByNodeId(data.sourceRefId);
    const targetElem = modeler.getElementByNodeId(data.targetRefId);
    if (sourceElem && targetElem) {
      const flow = new DataOutputAssociation(modeler.nodeRegistry, modeler.moddle, paper);
      const actualFlow = flow.makeFlowNode(sourceElem, targetElem, data.waypoint);
      // add Nodes
      modeler.addNode(actualFlow, data.id, true);
      const nodeIdIterator = getNodeIdGenerator(modeler.definitions);
      nodeIdIterator.updateCounters();
    }
  },
};
