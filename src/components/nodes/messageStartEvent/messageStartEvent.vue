<script>
import startMailSymbol from "!!svg-inline-loader!@/assets/start-event-mail.svg";
import baseStartEvent from "@/components/nodes/baseStartEvent/baseStartEvent.vue";

export default {
  extends: baseStartEvent,
  data() {
    return {
      nodeIcon: startMailSymbol,
    };
  },
};
</script>
