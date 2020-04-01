<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import signalEventIcon from '!!svg-inline-loader!@/assets/boundary-signal-event-icon.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: BoundaryEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: signalEventIcon,
    };
  },
  mounted() {
    const bounds = this.node.diagram.bounds;
    this.shape.resize(bounds.get('width'), bounds.get('height'));
    this.shape.attr({
      image: {
        'ref-x': 3,
        'ref-y': 1,
        'width': bounds.get('width') - 15,
        'height': bounds.get('height') - 15,
      },
    });
  },
};
</script>
