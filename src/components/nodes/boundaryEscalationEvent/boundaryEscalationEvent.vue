<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import escalationIcon from '@/assets/boundary-escalation-icon.svg';
import { isValidBoundaryEscalationEvent } from '@/targetValidationUtils';

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
