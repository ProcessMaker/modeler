<script>
import Task from '../task/task';
import userIcon from '!!svg-inline-loader!@/assets/user-task.svg';

export default {
  extends: Task,
  mounted() {
    this.shape.attr('image/xlink:href', encodeAsDataUri(userIcon));
  },
};

const encodeAsDataUri = (svgString) => {
  const base64 = btoa(svgString);
  return `data:image/svg+xml;base64,${base64}`;
};
</script>
