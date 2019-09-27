<template>
  <div/>
</template>

<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import errorBoltIcon from '@/assets/boundary-error-event-icon.svg';
import validBoundaryEventTargets from '@/components/nodes/boundaryEvent/validBoundaryEventTargets';
import { getAttachedErrorBoundaryEvents } from '@/targetValidationUtils';

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
      return model.component &&
        validBoundaryEventTargets.includes(model.component.node.definition.$type) &&
        this.doesNotHaveOtherBoundaryEvents(model);
    },
  },
  mounted() {
    this.shape.attr('image/xlink:href', errorBoltIcon);
  },
};
</script>
