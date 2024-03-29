import component from './dataInputAssociation.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import * as config from './config';
import { DataInputAssociation } from './DataInputAssociation';
import { getNodeIdGenerator } from '@/NodeIdGenerator';

export default {
  ...config,
  component,
  control: false,
  inspectorConfig: [
    {
      name: 'Data Input Association',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-data-input-association',
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
      const flow = new DataInputAssociation(modeler.nodeRegistry, modeler.moddle, paper);
      const actualFlow = flow.makeFlowNode(sourceElem, targetElem, data.waypoint);

      targetElem.component.node.definition.set('dataInputAssociations', [actualFlow.definition]);
      // add Nodes
      modeler.addNode(actualFlow, data.id, true);
      const nodeIdIterator = getNodeIdGenerator(modeler.definitions);
      nodeIdIterator.updateCounters();
    }
  },
};
