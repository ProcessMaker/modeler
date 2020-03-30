<script>
import Task from '../task/task';
import userIcon from '!!svg-inline-loader!@/assets/user-task.svg';

export default {
  extends: Task,
  mounted() {
    this.shape.attr('image/xlink:href', userIcon);
  },
};
</script>
