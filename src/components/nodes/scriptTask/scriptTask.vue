<script>
import TaskComponent from '@/components/nodes/task/task';
import scriptIcon from '@/assets/script.svg';

export default {
  extends: TaskComponent,
  data() {
    return {
      boundaryEventDropdownData: [
        {
          label: 'Boundary Timer Event',
          nodeType: 'processmaker-modeler-boundary-timer-event',
          dataTest: 'add-boundary-timer-event',
        },
        {
          label: 'Boundary Error Event',
          nodeType: 'processmaker-modeler-boundary-error-event',
          dataTest: 'add-boundary-error-event',
        },
      ],
    };
  },
  mounted() {
    this.shape.attr('image/xlink:href', scriptIcon);
  },
};
</script>
