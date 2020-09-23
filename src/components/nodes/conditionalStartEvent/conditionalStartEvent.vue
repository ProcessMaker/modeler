<script>
import baseStartEvent from '@/components/nodes/baseStartEvent/baseStartEvent';
import conditionalStartEventIcon from '!!svg-inline-loader!@/assets/conditional-start-event.svg';

export default {
  extends: baseStartEvent,
  data() {
    return {
      nodeIcon: conditionalStartEventIcon,
    };
  },
  mounted() {
    this.shape.attr({
      image: {
        'ref-x': 5,
        'ref-y': 3,
      },
    });
  },
};
</script>
