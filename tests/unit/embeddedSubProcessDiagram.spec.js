import BpmnModdle from 'bpmn-moddle';
import {
  dedupeProcessFlowElementsNestedInSubProcesses,
  getSubProcessBpmnDiagram,
  normalizeEmbeddedSubProcessDi,
  pruneOrphanSubProcessDiagrams,
  removeSubProcessBpmnDiagram,
} from '@/components/nodes/embeddedSubProcess/embeddedSubProcessDiagram';

describe('dedupeProcessFlowElementsNestedInSubProcesses', () => {
  it('removes subprocess children incorrectly listed on the process', () => {
    const moddle = new BpmnModdle();
    const process = moddle.create('bpmn:Process', { id: 'Process_1', isExecutable: true, flowElements:[]});
    const subProcess = moddle.create('bpmn:SubProcess', { id: 'node_16', flowElements:[]});
    const start = moddle.create('bpmn:StartEvent', { id: 'node_17' });
    const end = moddle.create('bpmn:EndEvent', { id: 'node_18' });
    subProcess.get('flowElements').push(start, end);
    process.get('flowElements').push(subProcess, start, end);

    dedupeProcessFlowElementsNestedInSubProcesses({
      rootElements: [process],
    });

    expect(process.get('flowElements').map((el) => el.id)).toEqual(['node_16']);
    expect(subProcess.get('flowElements').map((el) => el.id)).toEqual(
      expect.arrayContaining(['node_17', 'node_18']),
    );
  });
});

describe('subprocess BPMNDiagram cleanup', () => {
  it('removeSubProcessBpmnDiagram removes the matching diagram', () => {
    const moddle = new BpmnModdle();
    const subprocess = moddle.create('bpmn:SubProcess', { id: 'node_16' });
    const mainDiagram = moddle.create('bpmndi:BPMNDiagram', { id: 'main_di' });
    const subDiagram = moddle.create('bpmndi:BPMNDiagram', { id: 'node_16_diagram' });
    subDiagram.set('plane', moddle.create('bpmndi:BPMNPlane', {
      id: 'node_16_plane',
      bpmnElement: subprocess,
    }));
    const definitions = moddle.create('bpmn:Definitions', {
      rootElements: [],
      diagrams: [mainDiagram, subDiagram],
    });

    removeSubProcessBpmnDiagram(definitions, subprocess);

    expect(definitions.get('diagrams')).toHaveLength(1);
    expect(definitions.get('diagrams')[0].id).toBe('main_di');
  });

  it('pruneOrphanSubProcessDiagrams removes stale or invalid extra diagrams', () => {
    const moddle = new BpmnModdle();
    const process = moddle.create('bpmn:Process', { id: 'Process_1', flowElements:[]});
    const subprocess = moddle.create('bpmn:SubProcess', { id: 'node_16', flowElements:[]});
    process.get('flowElements').push(subprocess);

    const mainDiagram = moddle.create('bpmndi:BPMNDiagram', { id: 'main_di' });
    const validSubDiagram = moddle.create('bpmndi:BPMNDiagram', { id: 'node_16_diagram' });
    validSubDiagram.set('plane', moddle.create('bpmndi:BPMNPlane', {
      id: 'node_16_plane',
      bpmnElement: subprocess,
    }));
    const orphanDiagram = moddle.create('bpmndi:BPMNDiagram', { id: 'node_42_diagram' });
    orphanDiagram.set('plane', moddle.create('bpmndi:BPMNPlane', { id: 'node_42_plane' }));
    const callActivity = moddle.create('bpmn:CallActivity', { id: 'node_70' });
    const callActivityDiagram = moddle.create('bpmndi:BPMNDiagram', { id: 'node_70_diagram' });
    callActivityDiagram.set('plane', moddle.create('bpmndi:BPMNPlane', {
      id: 'node_70_plane',
      bpmnElement: callActivity,
    }));

    const definitions = moddle.create('bpmn:Definitions', {
      rootElements: [process],
      diagrams: [mainDiagram, orphanDiagram, callActivityDiagram, validSubDiagram],
    });

    pruneOrphanSubProcessDiagrams(definitions);

    const diagramIds = definitions.get('diagrams').map((diagram) => diagram.id);
    expect(diagramIds).toEqual(['main_di', 'node_16_diagram']);
  });
});

describe('normalizeEmbeddedSubProcessDi', () => {
  it('moves child shapes and edges to a second BPMNDiagram for the subprocess', async() => {
    const moddle = new BpmnModdle();
    const definitions = moddle.create('bpmn:Definitions', { rootElements: [], diagrams:[]});

    const process = moddle.create('bpmn:Process', { id: 'Process_1', isExecutable: true, flowElements:[]});
    const subProcess = moddle.create('bpmn:SubProcess', {
      id: 'node_16',
      name: 'Sub Process',
      flowElements: [],
    });
    const start = moddle.create('bpmn:StartEvent', { id: 'node_17', name: 'Start' });
    const flow = moddle.create('bpmn:SequenceFlow', {
      id: 'node_24',
      sourceRef: start,
      targetRef: start,
    });

    subProcess.get('flowElements').push(start, flow);
    process.get('flowElements').push(subProcess);
    definitions.get('rootElements').push(process);

    const diagram = moddle.create('bpmndi:BPMNDiagram', { id: 'BPMNDiagram_1' });
    const rootPlane = moddle.create('bpmndi:BPMNPlane', { id: 'BPMNPlane_1', bpmnElement: process });
    const subShape = moddle.create('bpmndi:BPMNShape', {
      id: 'node_16_di',
      bpmnElement: subProcess,
      isExpanded: false,
      bounds: moddle.create('dc:Bounds', { x: 0, y: 0, width: 100, height: 80 }),
    });
    const startShape = moddle.create('bpmndi:BPMNShape', {
      id: 'node_17_di',
      bpmnElement: start,
      bounds: moddle.create('dc:Bounds', { x: 10, y: 10, width: 36, height: 36 }),
    });
    const flowEdge = moddle.create('bpmndi:BPMNEdge', {
      id: 'node_24_di',
      bpmnElement: flow,
    });

    rootPlane.set('planeElement', [subShape, startShape, flowEdge]);
    diagram.set('plane', rootPlane);
    definitions.get('diagrams').push(diagram);

    normalizeEmbeddedSubProcessDi(definitions);

    expect(rootPlane.get('planeElement')).toHaveLength(1);
    expect(rootPlane.get('planeElement')[0].bpmnElement).toBe(subProcess);

    expect(definitions.get('diagrams')).toHaveLength(2);

    const subProcessDiagram = getSubProcessBpmnDiagram(definitions, subProcess);
    expect(subProcessDiagram).toBeDefined();
    expect(subProcessDiagram.plane.bpmnElement).toBe(subProcess);
    expect(subProcessDiagram.plane.get('planeElement')).toHaveLength(2);
    expect(subProcessDiagram.plane.get('planeElement').map((el) => el.bpmnElement.id)).toEqual(
      expect.arrayContaining(['node_17', 'node_24']),
    );
  });

  it('serializes subprocess children via a separate BPMNDiagram without XML patching', async() => {
    const moddle = new BpmnModdle();
    const definitions = moddle.create('bpmn:Definitions', { rootElements: [], diagrams:[]});
    const process = moddle.create('bpmn:Process', { id: 'Process_1', isExecutable: true, flowElements:[]});
    const subProcess = moddle.create('bpmn:SubProcess', {
      id: 'node_16',
      flowElements: [moddle.create('bpmn:StartEvent', { id: 'node_17' })],
    });
    process.get('flowElements').push(subProcess);
    definitions.get('rootElements').push(process);

    const subShape = moddle.create('bpmndi:BPMNShape', {
      id: 'node_16_di',
      bpmnElement: subProcess,
      isExpanded: false,
      bounds: moddle.create('dc:Bounds', { x: 0, y: 0, width: 100, height: 80 }),
    });
    const startShape = moddle.create('bpmndi:BPMNShape', {
      id: 'node_17_di',
      bpmnElement: subProcess.get('flowElements')[0],
      bounds: moddle.create('dc:Bounds', { x: 10, y: 10, width: 36, height: 36 }),
    });

    const diagram = moddle.create('bpmndi:BPMNDiagram', { id: 'BPMNDiagram_1' });
    const rootPlane = moddle.create('bpmndi:BPMNPlane', { id: 'BPMNPlane_1', bpmnElement: process });
    rootPlane.set('planeElement', [subShape, startShape]);
    diagram.set('plane', rootPlane);
    definitions.get('diagrams').push(diagram);

    normalizeEmbeddedSubProcessDi(definitions);

    const xml = await new Promise((resolve, reject) => {
      moddle.toXML(definitions, { format: true }, (err, result) => (err ? reject(err) : resolve(result)));
    });

    expect(xml).not.toContain('planeElement="[object Object]"');
    expect(xml).toContain('<bpmndi:BPMNDiagram');
    expect(xml).toContain('<bpmndi:BPMNPlane id="node_16_plane" bpmnElement="node_16">');
    expect(xml).toContain('<bpmndi:BPMNShape id="node_17_di" bpmnElement="node_17">');
    expect(xml).toMatch(
      /<bpmndi:BPMNShape id="node_16_di"[^>]*>\s*<dc:Bounds[^/]+\/>\s*<\/bpmndi:BPMNShape>/,
    );
    expect((xml.match(/<bpmndi:BPMNDiagram/g) || []).length).toBe(2);
  });
});
