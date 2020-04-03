<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateSignalCatchEventSymbol from '!!svg-inline-loader!@/assets/intermediate-signal-catch-event.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: IntermediateEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: intermediateSignalCatchEventSymbol,
    };
  },
  mounted() {
    this.shape.attr({
      image: {
        'ref-x': 7,
        'ref-y': 5,
        width: 22,
        height: 22,
      },
    });
  },
};
</script>
