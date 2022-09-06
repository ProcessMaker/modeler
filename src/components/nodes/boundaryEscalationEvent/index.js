import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import advancedAccordionConfig from "@/components/inspectors/advancedAccordionConfig";
import documentationAccordionConfig from "@/components/inspectors/documentationAccordionConfig";
import BoundaryEscalationEventIcon from "@/assets/toolpanel/boundary-escalation-event.svg";
import interruptingToggleConfig from "../boundaryEvent/interruptingToggleInspector";
import boundaryEventConfig from "../boundaryEvent";
import component from "./boundaryEscalationEvent.vue";

export const id = "processmaker-modeler-boundary-escalation-event";

export default merge(cloneDeep(boundaryEventConfig), {
  id,
  component,
  control: false,
  label: "Boundary Escalation Event",
  icon: BoundaryEscalationEventIcon,
  definition(moddle, $t) {
    return moddle.create("bpmn:BoundaryEvent", {
      name: $t("Boundary Escalation Event"),
      cancelActivity: true,
      eventDefinitions: [moddle.create("bpmn:EscalationEventDefinition")],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [{}, interruptingToggleConfig],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
});
