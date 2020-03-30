<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateSignalSymbol from '@/assets/intermediate-signal-alt.svg';

export default {
  extends: IntermediateEvent,
  props: ['moddle', 'rootElements', 'id'],
  mounted() {
    this.shape.attr({
      image: {
        'ref-x': 7,
        'ref-y': 5,
        'xlink:href': intermediateSignalSymbol,
        width: 22,
        height: 22,
      },
    });
  },
};
</script>
