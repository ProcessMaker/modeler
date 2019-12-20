<script>
import Task from '../task/task';
import userIcon from '@/assets/user-task.svg';

export default {
  extends: Task,
  mounted() {
    this.shape.attr('image/xlink:href', userIcon);
  },
};
</script>
