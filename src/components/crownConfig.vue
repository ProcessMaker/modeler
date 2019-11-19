<template>
  <div class="crown-config" :style="style" v-if="showCrown">
    <association-flow-button
      v-b-tooltip.hover.viewport.d50
      v-if="isTextAnnotation"
      @click="addAssociation"
      class="crown-config__icon"
      :title="$t('Association Flow')"
    />
    <sequence-flow-button
      v-if="isValidSequenceFlowSource"
      @click="addSequence"
      class="crown-config__icon"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Sequence Flow')"
    />
    <message-flow-button
      v-if="isValidMessageFlowSource"
      @click="addMessageFlow"
      class="crown-config__icon"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Message Flow')"
    />
    <delete-button
      @click="removeShape"
      class="crown-config__icon"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Delete')"
    />
  </div>
</template>

<script>
import DeleteButton from '@/components/deleteButton';
import MessageFlowButton from '@/components/messageFlowButton';
import SequenceFlowButton from '@/components/sequenceFlowButton';
import AssociationFlowButton from '@/components/associationFlowButton';
import poolLaneCrownConfig from '@/mixins/poolLaneCrownConfig';
import pull from 'lodash/pull';
import { direction } from '@/components/nodes/association/associationConfig';

export default {
  components: {
    DeleteButton,
    MessageFlowButton,
    SequenceFlowButton,
    AssociationFlowButton,
  },
  props: {
    highlighted: Boolean,
    paper: Object,
    graph: Object,
    shape: Object,
    node: Object,
    nodeRegistry: Object,
    moddle: Object,
    planeElements: Array,
    processNode: Object,
    collaboration: Object,
    isRendering: Boolean,
    /* allowSetNodePosition is used to prevent setting a node position outside of a pool */
    allowSetNodePosition: {
      default: true,
    },
  },
  mixins: [poolLaneCrownConfig],
  watch: {
    highlighted() {
      this.showCrown = this.highlighted;
    },
    shape() {
      if (this.highlighted) {
        this.showCrown = true;
      }
    },
  },
  data() {
    return {
      showCrown: false,
      savePositionOnPointerupEventSet: false,
      validMessageFlowSources: [
        'processmaker-modeler-start-event',
        'processmaker-modeler-end-event',
        'processmaker-modeler-task',
        'processmaker-modeler-pool',
        'processmaker-modeler-intermediate-message-catch-event',
      ],
      invalidSequenceFlowSources: [
        'processmaker-modeler-end-event',
        'processmaker-modeler-error-end-event',
        'processmaker-modeler-message-end-event',
        'processmaker-modeler-lane',
        'processmaker-modeler-text-annotation',
      ],
    };
  },
  created() {
    this.$t = this.$t.bind(this);
  },
  mounted() {
    this.$nextTick(() => {
      if (this.isRendering) {
        this.paper.once('render:done', this.setUpCrownConfig);
      } else {
        this.setUpCrownConfig();
      }
    });
  },
  computed: {
    style() {
      const { x, y, width: shapeWidth } = this.shape.findView(this.paper).getBBox();
      const width = (this.node.diagram.bounds.width * this.paper.scale().sx);
      const widthOffsetFromLabel = shapeWidth - width > 3 ? (shapeWidth / 2) - 15 : 0;

      return {
        top: `${y - 45}px`,
        left: `${x + width - 20 + widthOffsetFromLabel}px`,
        cursor: 'pointer',
      };
    },
    isValidMessageFlowSource() {
      return this.validMessageFlowSources.includes(this.node.type);
    },
    isTextAnnotation() {
      return this.node.type === 'processmaker-modeler-text-annotation';
    },
    isValidSequenceFlowSource() {
      return !this.invalidSequenceFlowSources.includes(this.node.type);
    },
    process() {
      return this.node.pool
        ? this.node.pool.component.containingProcess
        : this.processNode.definition;
    },
  },
  methods: {
    addSequence(cellView, evt, x, y) {
      this.removeCrown();
      const sequenceFlowConfig = this.nodeRegistry['processmaker-modeler-sequence-flow'];
      const sequenceLink = sequenceFlowConfig.definition(this.moddle, this.$t);
      sequenceLink.set('sourceRef', this.node.definition);
      sequenceLink.set('targetRef', { x, y });

      if (
        sequenceLink.sourceRef.$type === 'bpmn:ExclusiveGateway' ||
        sequenceLink.sourceRef.$type === 'bpmn:InclusiveGateway') {
        sequenceLink.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
          body: '',
        });
      }

      this.$emit('add-node', {
        type: 'processmaker-modeler-sequence-flow',
        definition: sequenceLink,
        diagram: sequenceFlowConfig.diagram(this.moddle),
      });
    },
    addMessageFlow(cellView, evt, x, y) {
      this.removeCrown();

      const messageFlowDefinition = this.moddle.create('bpmn:MessageFlow', {
        name: '',
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
      });

      this.$emit('add-node', {
        type: 'processmaker-modeler-message-flow',
        definition: messageFlowDefinition,
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
      });
    },
    addAssociation(cellView, evt, x, y) {
      this.removeCrown();
      const associationLink = this.moddle.create('bpmn:Association', {
        sourceRef: this.shape.component.node.definition,
        targetRef: { x, y },
        associationDirection: direction.none,
      });

      this.$emit('add-node', {
        type: 'processmaker-modeler-association',
        definition: associationLink,
        diagram: this.moddle.create('bpmndi:BPMNEdge'),
      });
    },
    removeShape() {
      this.graph.getConnectedLinks(this.shape).forEach(shape => this.$emit('remove-node', shape.component.node));
      this.shape.getEmbeddedCells({ deep: true }).forEach(cell => {
        if (cell.component) {
          this.graph.getConnectedLinks(cell).forEach(shape => this.$emit('remove-node', shape.component.node));
          this.shape.unembed(cell);
          this.$emit('remove-node', cell.component.node);
        }
      });

      this.$emit('remove-node', this.node);
    },
    removeCrown() {
      this.showCrown = false;
    },
    setNodePosition() {
      this.shape.stopListening(this.paper, 'element:pointerup', this.setNodePosition);
      this.savePositionOnPointerupEventSet = false;

      if (!this.allowSetNodePosition) {
        return;
      }

      this.$emit('save-state');
    },
    setUpCrownConfig() {
      this.shape.on('change:position', (element, newPosition) => {
        this.node.diagram.bounds.x = newPosition.x;
        this.node.diagram.bounds.y = newPosition.y;

        if (!this.savePositionOnPointerupEventSet) {
          this.shape.listenToOnce(this.paper, 'element:pointerup', this.setNodePosition);
          this.savePositionOnPointerupEventSet = true;
        }
      });

      if (!this.planeElements.includes(this.node.diagram)) {
        this.planeElements.push(this.node.diagram);
      }

      const nodeTypes = Object.keys(this.node.definition.$descriptor.allTypesByName);

      if (nodeTypes.includes('bpmn:FlowElement') && !this.process.get('flowElements').includes(this.node.definition)) {
        this.process.get('flowElements').push(this.node.definition);
      }

      if (nodeTypes.includes('bpmn:Artifact') && !this.process.get('artifacts').includes(this.node.definition)) {
        this.process.get('artifacts').push(this.node.definition);
      }

      if (
        this.collaboration &&
        nodeTypes.includes('bpmn:MessageFlow') &&
        !this.collaboration.get('messageFlows').includes(this.node.definition)
      ) {
        this.collaboration.get('messageFlows').push(this.node.definition);
      }
    },
  },
  destroyed() {
    this.shape.stopListening();
    this.shape.remove();

    pull(this.process.get('flowElements'), this.node.definition);
    pull(this.planeElements, this.node.diagram);
    pull(this.process.get('artifacts'), this.node.definition);

    if (this.collaboration) {
      pull(this.collaboration.get('messageFlows'), this.node.definition);
    }
  },
};
</script>

<style lang="scss">
  $primary-color: #5096db;

  .crown-config {
    background-color: $primary-color;
    position: absolute;
    z-index: 5;
    display: flex;
    justify-content: center;
    width: auto;
    height: 1.85rem;
    border-radius: 5px;

    &::after {
      background-color: $primary-color;
      content: '';
      width: 1.25rem;
      height: 1.25rem;
      position: absolute;
      top: 0.75rem;
      left: 0.45rem;
      z-index: -1;
      transform: rotate(45deg);
      border-radius: 1px;
    }

    &__icon {
      margin: 5px 10px;
      font-size: 1rem;
    }
  }
</style>
