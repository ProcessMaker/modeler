import nameConfigSettings from "@/components/inspectors/nameConfigSettings";
import advancedAccordionConfig from "@/components/inspectors/advancedAccordionConfig";
import documentationAccordionConfig from "@/components/inspectors/documentationAccordionConfig";
import defaultNames from "@/components/nodes/task/defaultNames";
import DataObjectIcon from "@/assets/toolpanel/data-object.svg";
import component from "./dataObject.vue";

export const id = "processmaker-modeler-data-object";

export default {
  id,
  component,
  bpmnType: "bpmn:DataObjectReference",
  control: true,
  category: "BPMN",
  icon: DataObjectIcon,
  label: defaultNames[id],
  rank: 80,
  validateIncoming() {
    return false;
  },
  definition(moddle, $t) {
    return moddle.create("bpmn:DataObjectReference", {
      name: $t(defaultNames[id])
    });
  },
  diagram(moddle) {
    return moddle.create("bpmndi:BPMNShape", {
      bounds: moddle.create("dc:Bounds", {
        height: 50,
        width: 36
      })
    });
  },
  inspectorConfig: [
    {
      name: defaultNames[id],
      items: [
        {
          component: "FormAccordion",
          container: true,
          config: {
            initiallyOpen: true,
            label: "Configuration",
            icon: "cog",
            name: "inspector-accordion-data-object"
          },
          items: [
            {
              component: "FormInput",
              config: nameConfigSettings
            }
          ]
        },
        documentationAccordionConfig,
        advancedAccordionConfig
      ]
    }
  ]
};
