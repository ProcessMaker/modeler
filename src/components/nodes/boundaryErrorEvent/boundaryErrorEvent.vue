<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import errorBoltIcon from '@/assets/boundary-error-event-icon.svg';
import isValidBoundaryEventTarget from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';
import { getAttachedErrorBoundaryEvents } from '@/boundaryEventValidation';

export default {
  extends: BoundaryEvent,
  methods: {
    doesNotHaveOtherBoundaryEvents(model) {
      return getAttachedErrorBoundaryEvents(model)
        .filter(boundaryEvent => {
          return boundaryEvent !== this.shape;
        })
        .length === 0;
    },
    isValidBoundaryEventTarget(model) {
      return isValidBoundaryEventTarget(model.component) &&
        this.doesNotHaveOtherBoundaryEvents(model);
    },
  },
  mounted() {
    this.shape.attr('image/xlink:href', errorBoltIcon);
  },
};
</script>
