<script>
import TaskComponent from '@/components/nodes/task/task';
import scriptIcon from '!!svg-inline-loader!@/assets/script.svg';
import coloredIcon from '@/components/iconColors';

export default {
  extends: TaskComponent,
  watch: {
    'node.definition.color': {
      handler() {
        this.shape.attr('image/xlink:href', coloredIcon(scriptIcon, this.node.definition.get('color')));
      },
      deep: true,
    },
  },
  mounted() {
    this.shape.attr('image/xlink:href', coloredIcon(scriptIcon, this.node.definition.get('color')));
  },
};
</script>
