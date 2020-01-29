<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateSignalCatchEventSymbol from '@/assets/intermediate-signal-catch-event.svg';

export default {
  extends: IntermediateEvent,
  mounted() {
    this.shape.attr({
      image: {
        'ref-x': 7,
        'ref-y': 5,
        'xlink:href': intermediateSignalCatchEventSymbol,
        width: 22,
        height: 22,
      },
    });
  },
};
</script>
