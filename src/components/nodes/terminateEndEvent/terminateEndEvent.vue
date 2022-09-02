<script>
import EndEvent from "@/components/nodes/endEvent/endEvent.vue";
import terminateIcon from "!!svg-inline-loader!@/assets/terminate-end-event.svg";
import updateIconColor from "@/mixins/updateIconColor";

export default {
  extends: EndEvent,
  mixins: [updateIconColor],
  props: ["moddle", "rootElements", "id"],
  data() {
    return {
      nodeIcon: terminateIcon
    };
  }
};
</script>
