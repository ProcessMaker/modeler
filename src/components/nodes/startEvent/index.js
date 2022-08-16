import merge from "lodash/merge";
import cloneDeep from "lodash/cloneDeep";
import baseStartEventConfig from "@/components/nodes/baseStartEvent";
import StartEventIcon from "@/assets/toolpanel/start-event.svg";
import defaultNames from "../baseStartEvent/defaultNames";
import component from "./startEvent.vue";

const id = "processmaker-modeler-start-event";

export default merge(cloneDeep(baseStartEventConfig), {
  id,
  component,
  control: true,
  icon: StartEventIcon,
  label: defaultNames[id],
  rank: 10,
  definition(moddle, $t) {
    return moddle.create("bpmn:StartEvent", {
      name: $t(defaultNames[id])
    });
  }
});
