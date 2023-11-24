import component from './poolLane';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import { id } from '@/components/nodes/poolLane/config';
import Node from '@/components/nodes/node';
import { elementShouldHaveFlowNodeRef } from '@/components/nodes/pool/poolUtils';
import { getNodeIdGenerator } from '@/NodeIdGenerator';

export default {
  id,
  component,
  bpmnType: 'bpmn:Lane',
  control: false,
  category: 'BPMN',
  label: 'Lane',
  definition(moddle) {
    return moddle.create('bpmn:Lane', {
      name: '',
    });
  },
  diagram: (moddle) => moddle.create('bpmndi:BPMNShape', {
    bounds: moddle.create('dc:Bounds', {
      height: 150,
      width: 600,
      x: null,
      y: null,
    }),
  }),
  inspectorConfig: [
    {
      name: 'Lane',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-pool-lane',
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
    const pool = modeler.getElementByNodeId(data.poolId);
    const definition = modeler.moddle.create('bpmn:Lane', {
      name: data.name,
    });
    // Set the position of the pool
    if (data.poolX && data.poolY) {
      pool.set('position', { x: data.poolX, y: data.poolY });
    }

    if (!pool.component.laneSet && pool.component.createLaneSet) {
      pool.component.createLaneSet([data.laneSetId]);
      /* If there are currently elements in the pool, add them to the first lane */
      pool.component.shape.getEmbeddedCells().filter(element => elementShouldHaveFlowNodeRef(element))
        .forEach(element => {
          definition.get('flowNodeRef').push(element.component.node.definition);
        });
      const nodeIdereator = getNodeIdGenerator(modeler.definitions);
      nodeIdereator.updateCounters();
    }
    const diagram = modeler.moddle.create('bpmndi:BPMNShape', {
      bounds: modeler.moddle.create('dc:Bounds', {
        height: data.height,
        width: data.width,
        x: data.x,
        y: data.y,
      }),
    });
    const node = new Node(
      data.type,
      definition,
      diagram,
    );

    // Set the pool as the parent of the lane
    node.pool = pool;

    await modeler.addNode(node, data.id, true);
    modeler.setShapeStacking(pool.component.shape);

  },
};
