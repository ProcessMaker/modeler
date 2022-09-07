import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import advancedAccordionConfig from "@/components/inspectors/advancedAccordionConfig";
import documentationAccordionConfig from "@/components/inspectors/documentationAccordionConfig";
import BoundaryMessageEventIcon from "@/assets/toolpanel/boundary-message-event.svg";
import interruptingToggleConfig from "../boundaryEvent/interruptingToggleInspector";
import boundaryEventConfig from "../boundaryEvent";
import component from "./boundaryMessageEvent.vue";
import messageEventDefinition, { messageSelector } from "../messageEventDefinition";

export const id = "processmaker-modeler-boundary-message-event";
export default merge(cloneDeep(boundaryEventConfig), {
  ...messageEventDefinition,
  id,
  component,
  control: false,
  label: "Boundary Message Event",
  icon: BoundaryMessageEventIcon,
  definition(moddle, $t) {
    return moddle.create("bpmn:BoundaryEvent", {
      name: $t("Boundary Message Event"),
      cancelActivity: true,
      eventDefinitions: [moddle.create("bpmn:MessageEventDefinition")],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [{}, interruptingToggleConfig, messageSelector("Message that will trigger this boundary event")],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
});
