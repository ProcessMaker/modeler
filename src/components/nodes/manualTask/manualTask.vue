<script>
import TaskComponent from '@/components/nodes/task/task';
import manualIcon from '!!svg-inline-loader!@/assets/manual-task.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: TaskComponent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: manualIcon,
      iconName: '',
    };
  },
};
</script>
