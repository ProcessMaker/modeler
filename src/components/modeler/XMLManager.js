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

        resolve(definitions);
      });
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
