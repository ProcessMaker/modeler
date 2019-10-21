<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import escalationIcon from '@/assets/boundary-escalation-icon.svg';
import validBoundaryEscalationEventTargets from './validBoundaryEscalationEventTargets';

export default {
  extends: BoundaryEvent,
  methods: {
    isValidBoundaryEventTarget(model) {
      return model.component && validBoundaryEscalationEventTargets.includes(model.component.node.definition.$type);
    },
  },
  mounted() {
    this.shape.attr('image/xlink:href', escalationIcon);
  },
};
</script>
