<script>
import Task from '../task/task';
import userIcon from '@/assets/user-task.svg?raw';
import updateIconColor from '@/mixins/updateIconColor';

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
