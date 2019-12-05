<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateMailIcon from '@/mixins/intermediateMailIcon';

export default {
  extends: IntermediateEvent,
  mixins: [intermediateMailIcon],
  mounted() {
    this.shape.attr({
      body: {
        stroke: '#FBBE02',
        fill: '#FFF4D1',
        strokeWidth: 2,
      },
      body2: {
        stroke: '#FBBE02',
        fill: '#FFF4D1',
        strokeWidth: 2,
      },
    });
  },
};
</script>
