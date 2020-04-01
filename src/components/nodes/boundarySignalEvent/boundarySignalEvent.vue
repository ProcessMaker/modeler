<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import signalEventIcon from '!!url-loader!@/assets/boundary-signal-event-icon.svg';

export default {
  extends: BoundaryEvent,
  mounted() {
    this.shape.attr('image/xlink:href', signalEventIcon);
    let bounds = this.node.diagram.bounds;
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
