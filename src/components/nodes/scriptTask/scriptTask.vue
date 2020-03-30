<script>
import TaskComponent from '@/components/nodes/task/task';
import scriptIcon from '!!svg-inline-loader!@/assets/script.svg';
import coloredIcon from '@/components/iconColors';

export default {
  extends: TaskComponent,
  mounted() {
    this.shape.attr('image/xlink:href', coloredIcon(scriptIcon, this.node.definition.get('color') || '#788793'));
  },
};
</script>
