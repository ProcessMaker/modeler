import runningInCypressTest from '@/runningInCypressTest';
import FilerSaver from 'file-saver';

export default class XMLManager {
  moddle;
  definitions;

  constructor(moddle, definitions) {
    this.moddle = moddle;
    this.definitions = definitions;
  }

  download() {
    this.moddle.toXML(this.definitions, { format: true }, (err, xml) => {
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
