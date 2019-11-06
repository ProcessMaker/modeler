import { addIdToNodeAndSetUpDiagramReference, addNodeToProcess, getTargetProcess } from '@/components/nodeManager';
import { id as poolId } from '@/components/nodes/pool';
import { id as laneId } from '@/components/nodes/poolLane';

describe('nodeManager', () => {
  describe('addIdToNodeAndSetUpDiagramReference', () => {
    it('should not change diagram ID if it already has an ID set', () => {
      const nodeId = 'foobar';
      const node = {
        definition: { id: nodeId },
        diagram: {},
      };

      addIdToNodeAndSetUpDiagramReference(node);

      expect(node.definition.id).toBe(nodeId);
      expect(node.diagram.id).toBe(`${nodeId}_di`);
      expect(node.diagram.bpmnElement).toBe(node.definition);
    });

    it('should not throw if node does not have a diagram', () => {
      const node = {
        definition: { id: 123 },
      };

      expect(() => addIdToNodeAndSetUpDiagramReference(node)).not.toThrow();
    });

    it('should use ID generator if definition does not have ID', () => {
      const nodeId = 'foobar';
      const nodeIdGenerator = { generateUniqueNodeId: () => nodeId };
      const node = {
        definition: {},
        diagram: {},
      };

      addIdToNodeAndSetUpDiagramReference(node, nodeIdGenerator);

      expect(node.definition.id).toBe(nodeId);
      expect(node.diagram.id).toBe(`${nodeId}_di`);
    });
  });

  describe('addNodeToProcess', () => {
    it('should not modify target process for pool nodes', () => {
      const node = { type: poolId };
      const targetProcess = {};

      addNodeToProcess(node, targetProcess);

      expect(targetProcess).toEqual({});
    });

    it('should not modify target process for node definition $type "bpmn:MessageFlow"', () => {
      const node = { definition: { $type: 'bpmn:MessageFlow' } };
      const targetProcess = {};

      addNodeToProcess(node, targetProcess);

      expect(targetProcess).toEqual({});
    });

    it('should set lane definition on target process lanes', () => {
      const node = {type: laneId, definition: {}};
      const targetProcess = {
        laneSets: [{
          lanes: [],
          get(key) {
            return this[key];
          },
        }],
        get(key) {
          return this[key];
        },
      };

      addNodeToProcess(node, targetProcess);

      expect(targetProcess.laneSets[0].lanes).toHaveLength(1);
      expect(targetProcess.laneSets[0].lanes[0]).toBe(node.definition);
    });

    it.each([
      'bpmn:TextAnnotation',
      'bpmn:Association',
    ])('should set definition on target process artifacts for node definition type %s', $type => {
      const node = { definition: { $type } };
      const targetProcess = {
        artifacts: [],
        get(key) {
          return this[key];
        },
      };

      addNodeToProcess(node, targetProcess);

      expect(targetProcess.artifacts).toHaveLength(1);
      expect(targetProcess.artifacts[0]).toBe(node.definition);
    });

    it('should set definition on target process flowElements for non-message-flow node', () => {
      const node = { definition: { $type: 'bpmn:NotMessageFlow' } };
      const targetProcess = {
        flowElements: [],
        get(key) {
          return this[key];
        },
      };

      addNodeToProcess(node, targetProcess);

      expect(targetProcess.flowElements).toHaveLength(1);
      expect(targetProcess.flowElements[0]).toBe(node.definition);
    });
  });

  describe('getTargetProcess', () => {
    it('should return processNode definition for node that does not have pool', () => {
      const node = {};
      const processNode = { definition: {} };

      const targetProcess = getTargetProcess(node, [], processNode);

      expect(targetProcess).toBe(processNode.definition);
    });

    it('should return matching pool process for node that has pool', () => {
      const targetProcessId = 'foobar';
      const process = { id: targetProcessId };
      const node = { pool: { component: { node: {definition: {
        processRef: { id: targetProcessId },
        get(key) {
          return this[key];
        },
      }}}}};
      const processes = [{}, {}, process, {}, {}];

      const targetProcess = getTargetProcess(node, processes, {});

      expect(targetProcess).toBe(process);
    });
  });
});
