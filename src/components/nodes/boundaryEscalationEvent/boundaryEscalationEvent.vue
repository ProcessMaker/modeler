<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import escalationIcon from '@/assets/boundary-escalation-icon.svg?raw';
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
