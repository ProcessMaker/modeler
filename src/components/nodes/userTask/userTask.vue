<script>
import Task from '../task/task';
import userIcon from '!!svg-inline-loader!@/assets/user-task.svg';

const encodeAsDataUri = (svgString) => {
  const base64 = btoa(svgString);
  return `data:image/svg+xml;base64,${base64}`;
};

export default {
  extends: Task,
  mounted() {
    const svg = (new DOMParser()).parseFromString(userIcon, 'text/xml');
    svg.querySelectorAll('*[fill]:not([fill="none"])').forEach(svgNode => {
      svgNode.setAttribute('fill', 'blue');
    });

    this.shape.attr('image/xlink:href', encodeAsDataUri(userIcon));
  },
};
</script>
