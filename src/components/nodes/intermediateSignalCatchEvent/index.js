import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import requestVariableSettings from "@/components/inspectors/requestVariableSettings";
import intermediateEventConfig from "@/components/nodes/intermediateEvent";
import defaultNames from "@/components/nodes/intermediateEvent/defaultNames";
import signalEventDefinition, { signalSelector } from "../signalEventDefinition";
import component from "./intermediateSignalCatchEvent.vue";

const id = "processmaker-modeler-intermediate-signal-catch-event";

export default merge(cloneDeep(intermediateEventConfig), {
  ...signalEventDefinition,
  id,
  component,
  control: false,
  bpmnType: "bpmn:IntermediateCatchEvent",
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create("bpmn:IntermediateCatchEvent", {
      name: $t(defaultNames[id]),
      eventDefinitions: [moddle.create("bpmn:SignalEventDefinition")],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [
            {},
            signalSelector("Signal that will catch this intermediate event", false),
            {
              component: "FormInput",
              config: requestVariableSettings,
            },
          ],
        },
      ],
    },
  ],
});
