<script>
import TaskComponent from "@/components/nodes/task/task.vue";
import scriptIcon from "!!svg-inline-loader!@/assets/script.svg";
import updateIconColor from "@/mixins/updateIconColor";

export default {
  extends: TaskComponent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: scriptIcon,
      iconName: ""
    };
  }
};
</script>
