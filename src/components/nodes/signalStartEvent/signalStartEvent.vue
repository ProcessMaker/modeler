<script>
import startEvent from '../startEvent/startEvent';
import signalStartEventIcon from '!!svg-inline-loader!@/assets/signal-start-event.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: startEvent,
  props: ['moddle', 'rootElements', 'id'],
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: signalStartEventIcon,
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
