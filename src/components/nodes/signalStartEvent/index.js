import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import requestVariableSettings from "@/components/inspectors/requestVariableSettings";
import defaultNames from "@/components/nodes/baseStartEvent/defaultNames";
import baseStartEventConfig from "../baseStartEvent";
import signalEventDefinition, { signalSelector } from "../signalEventDefinition";
import component from "./signalStartEvent.vue";

const id = "processmaker-modeler-signal-start-event";

export default merge(cloneDeep(baseStartEventConfig), {
  ...signalEventDefinition,
  id,
  component,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create("bpmn:StartEvent", {
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
            signalSelector("Signal that will trigger this start event", false),
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
