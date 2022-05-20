import runningInCypressTest from '@/runningInCypressTest';
import FilerSaver from 'file-saver';

export default class XMLManager {
  #moddle;
  #definitions;

  constructor(moddle) {
    this.#moddle = moddle;
  }

  set definitions(definitions) {
    this.#definitions = definitions;
  }

  getDefinitionsFromXml(xmlString) {
    return new Promise((resolve, reject) => {
      this.#moddle.fromXML(xmlString, (err, definitions) => {
        if (err) {
          reject(err);
        }

        definitions.exporter = 'ProcessMaker Modeler';
        definitions.exporterVersion = '1.0';

        // Clean broken references when loading definitions
        this.cleanBrokenReferences(definitions);

        resolve(definitions);
      });
    });
  }

  cleanBrokenReferences(definitions) {
    const { rootElements, diagrams } = definitions;
    const removed = [];

    // Remove broken bpmn:SequenceFlow from bpmn:Process
    rootElements.forEach(element => {
      if (element.$type === 'bpmn:Process' && element.flowElements) {
        element.flowElements = element.flowElements.filter(child => {
          if (child.$type === 'bpmn:SequenceFlow') {
            if (!(child.sourceRef && child.targetRef)) {
              removed.push(child);
            }
            return child.sourceRef && child.targetRef;
          }
          return true;
        });
      }
      if (element.$type === 'bpmn:Process' && element.laneSets) {
        element.laneSets.forEach(laneSet => {
          laneSet.lanes = laneSet.lanes.filter(node => {
            if (!definitions.diagrams) {
              return false;
            }
            const laneHasShape = definitions.diagrams.find(diagram => diagram.plane.planeElement.find(shape => {
              return shape && shape.bpmnElement.id === node.id;
            }));
            return laneHasShape;
          });
        });
      }
    });

    // Remove BPMNEdge from bpmndi:BPMNDiagram
    diagrams.forEach(element => {
      if (element.$type === 'bpmndi:BPMNDiagram' && element.plane && element.plane.planeElement) {
        element.plane.planeElement = element.plane.planeElement.filter(child => {
          if (child.$type === 'bpmndi:BPMNEdge') {
            return child.bpmnElement && !removed.includes(child.bpmnElement);
          }
          return true;
        });
      }
    });
  }

  download() {
    if (!this.#definitions) {
      return;
    }

    this.#moddle.toXML(this.#definitions, { format: true }, (err, xml) => {
      if (err) {
        alert(err);
      } else {
        if (runningInCypressTest()) {
          /* Save XML string to window–this is used in testing to compare against known valid XML */
          window.xml = xml;
          return;
        }

        const file = new File([xml], 'bpmnProcess.xml', { type: 'text/xml' });
        FilerSaver.saveAs(file);
      }
    });
  }
}
