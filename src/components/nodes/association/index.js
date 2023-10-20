import { getNodeIdGenerator } from '@/NodeIdGenerator';
import component from './association.vue';
import { id, bpmnType, direction, definition, diagram } from './associationConfig';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import { AssociationFlow } from './AssociationFlow';

export default {
  id,
  component,
  bpmnType,
  control: false,
  definition,
  diagram,
  inspectorConfig: [
    {
      name: 'Data Association',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-association',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
            {
              component: 'FormSelect',
              config: {
                label: 'Direction',
                helper: 'Select Direction',
                name: 'associationDirection',
                options: [
                  { value: `${direction.none}`, content: 'None' },
                  { value: `${direction.one}`, content: 'One' },
                  { value: `${direction.both}`, content: 'Both' },
                ],
              },
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
      const flow = new AssociationFlow(modeler.nodeRegistry, modeler.moddle, paper);
      const actualFlow = flow.makeFlowNode(sourceElem, targetElem, data.waypoint);
      // add Nodes
      modeler.addNode(actualFlow, data.id, true);
      const nodeIdIterator = getNodeIdGenerator(modeler.definitions);
      nodeIdIterator.updateCounters();
    }
  },
};
