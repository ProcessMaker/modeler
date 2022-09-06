<script>
import userIcon from "!!svg-inline-loader!@/assets/user-task.svg";
import updateIconColor from "@/mixins/updateIconColor";
import Task from "../task/task.vue";

export default {
  extends: Task,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: userIcon,
    };
  },
};
</script>
