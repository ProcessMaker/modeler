<script>
import TaskComponent from '@/components/nodes/task/task';
import scriptIcon from '@/assets/script.svg?raw';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: TaskComponent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: scriptIcon,
      iconName: '',
    };
  },
};
</script>
