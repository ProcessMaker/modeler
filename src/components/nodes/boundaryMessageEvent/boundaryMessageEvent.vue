<script>
import BoundaryEvent from "@/components/nodes/boundaryEvent/boundaryEvent.vue";
import getIntermediateMailIconShapeAttributes from "@/mixins/intermediateMailIcon";
import boundaryMessageMailSymbol from "!!svg-inline-loader!@/assets/boundary-message-event.svg";
import updateIconColor from "@/mixins/updateIconColor";

export default {
  extends: BoundaryEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: boundaryMessageMailSymbol
    };
  },
  mounted() {
    const shapeAttributes = getIntermediateMailIconShapeAttributes();
    this.shape.attr(shapeAttributes);
  },
  methods: {
    isValidBoundaryEventTarget(model) {
      const { component } = model;
      return component && component.node.isBpmnType("bpmn:CallActivity");
    }
  }
};
</script>
