import { addNodeToProcess } from '@/components/nodeManager';
import Node from '@/components/nodes/node';

describe('nodeManager', () => {
  describe('add id to to node and set up diagram reference', () => {
    it('should not change node ID if it already has an ID set', () => {
      const nodeId = 'foobar';
      const newNodeId = 'baz';
      const diagramId = 'diagram_id';
      const node = new Node(
        'foo',
        { id: nodeId },
        {},
      );
      const nodeIdGenerator = {
        generate: () => ([newNodeId, diagramId]),
      };

      node.setIds(nodeIdGenerator);

      expect(node.id).toBe(nodeId);
      expect(node.diagram.id).toBe(diagramId);
      expect(node.diagram.bpmnElement).toBe(node.definition);
    });

    it('should not throw if node does not have a diagram', () => {
      const node = new Node(
        'foo',
        { id: 123 },
        {},
      );
      const nodeIdGenerator = {
        generate: () => ([]),
      };

      expect(() => node.setIds(nodeIdGenerator)).not.toThrow();
    });

    it('should use ID generator if definition does not have ID', () => {
      const nodeId = 'foobar';
      const diagramId = 'baz';
      const nodeIdGenerator = { generate: () => [nodeId, diagramId]};
      const node = new Node('foo', {}, {});

      node.setIds(nodeIdGenerator);

      expect(node.id).toBe(nodeId);
      expect(node.diagram.id).toBe(diagramId);
    });
  });

  describe('addNodeToProcess', () => {
    it('should not modify target process for pool nodes', () => {
      const node = new Node('processmaker-modeler-pool', {}, {});
      const targetProcess = {};

      addNodeToProcess(node, targetProcess);

      expect(targetProcess).toEqual({});
    });

    it('should not modify target process for node definition $type "bpmn:MessageFlow"', () => {
      const node = new Node('foo', { $type: 'bpmn:MessageFlow' }, {});
      const targetProcess = {};

      addNodeToProcess(node, targetProcess);

      expect(targetProcess).toEqual({});
    });

    it('should set lane definition on target process lanes', () => {
      const node = new Node('processmaker-modeler-lane', {}, {});
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
      const node = new Node('foo', { $type }, {});
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
      const node = new Node('Foo', { $type: 'bpmn:NotMessageFlow' }, {});
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

  describe('get target process', () => {
    it('should return processNode definition for node that does not have pool', () => {
      const node = new Node('Foo', {}, {});
      const processNode = new Node('Bar', {}, {});

      const targetProcess = node.getTargetProcess([], processNode);

      expect(targetProcess).toBe(processNode.definition);
    });

    it('should return matching pool process for node that has pool', () => {
      const targetProcessId = 'foobar';
      const process = { id: targetProcessId };
      const node = new Node('Foo', {}, {});
      node.pool = {
        component: {
          node: new Node('FooBar',
            {
              processRef: { id: targetProcessId },
              get(key) {
                return this[key];
              },
            },
            {},
          ),
        },
      };
      const processes = [{}, {}, process, {}, {}];

      const targetProcess = node.getTargetProcess(processes, {});

      expect(targetProcess).toBe(process);
    });
  });
})
;
