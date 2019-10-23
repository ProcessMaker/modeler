<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import intermediateMailIcon from '@/mixins/intermediateMailIcon';

export default {
  extends: BoundaryEvent,
  mixins: [intermediateMailIcon],
  methods: {
    isValidBoundaryEventTarget(model) {
      const component = model.component;
      return component && component.node.definition.$type === 'bpmn:CallActivity';
    },
  },
};
</script>
