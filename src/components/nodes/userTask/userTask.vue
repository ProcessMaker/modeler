<script>
import Task from '../task/task';
import userIcon from '!!svg-inline-loader!@/assets/user-task.svg';
import coloredIcon from '@/components/iconColors';

export default {
  extends: Task,
  watch: {
    'node.definition.color': {
      handler() {
        this.shape.attr('image/xlink:href', coloredIcon(userIcon, this.node.definition.get('color')));
      },
      deep: true,
    },
  },
  mounted() {
    this.shape.attr('image/xlink:href', coloredIcon(userIcon, this.node.definition.get('color')));
  },
};
</script>
