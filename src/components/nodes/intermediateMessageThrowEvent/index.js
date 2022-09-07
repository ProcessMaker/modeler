import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import intermediateMessageEventConfig from "@/components/nodes/intermediateMessageEvent";
import defaultNames from "@/components/nodes/intermediateEvent/defaultNames";
import IntermediateMessageThrowEventSvg from "@/assets/toolpanel/intermediate-message-throw-event.svg";
import messageEventDefinition, { messageSelector } from "../messageEventDefinition";
import component from "./intermediateMessageThrowEvent.vue";

const id = "processmaker-modeler-intermediate-message-throw-event";

export default merge(cloneDeep(intermediateMessageEventConfig), {
  ...messageEventDefinition,
  id,
  component,
  control: false,
  bpmnType: "bpmn:IntermediateThrowEvent",
  label: defaultNames[id],
  icon: IntermediateMessageThrowEventSvg,
  definition(moddle, $t) {
    return moddle.create("bpmn:IntermediateThrowEvent", {
      name: $t(defaultNames[id]),
      eventDefinitions: [moddle.create("bpmn:MessageEventDefinition")],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [{}, messageSelector("Select the message reference that this element throws")],
        },
      ],
    },
  ],
});
