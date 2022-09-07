import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import advancedAccordionConfig from "@/components/inspectors/advancedAccordionConfig";
import documentationAccordionConfig from "@/components/inspectors/documentationAccordionConfig";
import interruptingToggleConfig from "../boundaryEvent/interruptingToggleInspector";
import boundaryEventConfig from "../boundaryEvent";
import component from "./boundaryConditionalEvent.vue";
import eventDefinition, { inspector } from "../conditionalEventDefinition";

export default merge(cloneDeep(boundaryEventConfig), {
  ...eventDefinition,
  id: "processmaker-modeler-boundary-conditional-event",
  component,
  control: false,
  label: "Boundary Conditional Event",
  definition(moddle, $t) {
    return moddle.create("bpmn:BoundaryEvent", {
      name: $t("Boundary Conditional Event"),
      cancelActivity: true,
      eventDefinitions: [
        moddle.create("bpmn:ConditionalEventDefinition", {
          condition: moddle.create("bpmn:FormalExpression", {
            body: "",
          }),
        }),
      ],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [{}, ...inspector(), interruptingToggleConfig],
        },
        advancedAccordionConfig,
        documentationAccordionConfig,
      ],
    },
  ],
});
