<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import escalationIcon from '!!url-loader!@/assets/boundary-escalation-icon.svg';
import { isValidBoundaryEscalationEvent } from '@/boundaryEventValidation';

export default {
  extends: BoundaryEvent,
  mounted() {
    this.shape.attr('image/xlink:href', escalationIcon);
  },
  methods: {
    isValidBoundaryEventTarget(model) {
      return isValidBoundaryEscalationEvent(model.component);
    },
  },
};
</script>
