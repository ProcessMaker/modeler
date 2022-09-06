import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import defaultNames from "@/components/nodes/baseStartEvent/defaultNames";
import baseStartEventConfig from "@/components/nodes/baseStartEvent";
import messageEventDefinition, { messageSelector } from "../messageEventDefinition";
import component from "./messageStartEvent.vue";

const id = "processmaker-modeler-message-start-event";

export default merge(cloneDeep(baseStartEventConfig), {
  ...messageEventDefinition,
  id,
  component,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create("bpmn:StartEvent", {
      name: $t(defaultNames[id]),
      eventDefinitions: [moddle.create("bpmn:MessageEventDefinition")],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [{}, messageSelector("Message that will trigger this start event")],
        },
      ],
    },
  ],
});
