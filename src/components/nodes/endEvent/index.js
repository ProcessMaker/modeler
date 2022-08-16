import nameConfigSettings from "@/components/inspectors/nameConfigSettings";
import advancedAccordionConfig from "@/components/inspectors/advancedAccordionConfig";
import documentationAccordionConfig from "@/components/inspectors/documentationAccordionConfig";
import defaultNames from "@/components/nodes/endEvent/defaultNames";
import EndEventIcon from "@/assets/toolpanel/end-event.svg";
import component from "./endEvent.vue";

const id = "processmaker-modeler-end-event";

export default {
  id,
  component,
  bpmnType: "bpmn:EndEvent",
  control: true,
  category: "BPMN",
  icon: EndEventIcon,
  label: defaultNames[id],
  rank: 30,
  definition(moddle, $t) {
    return moddle.create("bpmn:EndEvent", {
      name: $t(defaultNames[id])
    });
  },
  diagram(moddle) {
    return moddle.create("bpmndi:BPMNShape", {
      bounds: moddle.create("dc:Bounds", {
        height: 36,
        width: 36,
        x: null,
        y: null
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
            name: "inspector-accordion-end-event"
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
