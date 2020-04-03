<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateSignalSymbol from '!!svg-inline-loader!@/assets/intermediate-signal-alt.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: IntermediateEvent,
  mixins: [updateIconColor],
  props: ['moddle', 'rootElements', 'id'],
  data() {
    return {
      nodeIcon: intermediateSignalSymbol,
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
