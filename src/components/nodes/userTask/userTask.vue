<script>
import Task from '../task/task';
import userIcon from '!!svg-inline-loader!@/assets/user-task.svg';
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
