<template>
  <div class="crown-config" :style="style" v-if="showCrown" role="menu">
    <slot />
    <association-flow-button
      v-b-tooltip.hover.viewport.d50
      v-if="isTextAnnotation"
      @click="addAssociation"
      :title="$t('Association Flow')"
      role="menuitem"
    />
    <sequence-flow-button
      v-if="isValidSequenceFlowSource"
      @click="addSequence"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Sequence Flow')"
      role="menuitem"
    />
    <message-flow-button
      v-if="isValidMessageFlowSource"
      @click="addMessageFlow"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Message Flow')"
      role="menuitem"
    />

    <crown-dropdown
      :dropdown-data="dropdownData"
      :node="node"
      :show-dropdown="showDropdown"
      @replace-node="replaceNode"
    />

    <crown-boundary-event-dropdown
      v-if="boundaryEventDropdownData"
      :dropdown-data="boundaryEventDropdownData"
      :nodeRegistry="nodeRegistry"
      :moddle="moddle"
      :node="node"
      :shape="shape"
      @click="showDropdown = false"
      @add-boundary-event="$emit('add-node', $event)"
    />

    <delete-button
      @click="removeShape"
      v-b-tooltip.hover.viewport.d50
      :title="$t('Delete')"
      role="menuitem"
    />
  </div>
</template>

<script>
import DeleteButton from '@/components/deleteButton';
import MessageFlowButton from '@/components/messageFlowButton';
import SequenceFlowButton from '@/components/sequenceFlowButton';
import AssociationFlowButton from '@/components/associationFlowButton';
import CrownDropdown from '@/components/crownDropdown';
import CrownBoundaryEventDropdown from '@/components/crownBoundaryEventDropdown';
import poolLaneCrownConfig from '@/mixins/poolLaneCrownConfig';
import pull from 'lodash/pull';
import { direction } from '@/components/nodes/association/associationConfig';
import store from '@/store';

export default {
  components: {
    CrownDropdown,
    CrownBoundaryEventDropdown,
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
    dropdownData: {
      type: Array,
      default: () => [],
    },
    boundaryEventDropdownData: {
      type: Array,
      default: null,
    },
  },
  mixins: [poolLaneCrownConfig],
  watch: {
    highlighted() {
      this.showCrown = this.highlighted;
      if (!this.highlighted && this.showDropdown) {
        this.showDropdown = false;
      }
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
        'processmaker-modeler-sequence-flow',
        'processmaker-modeler-message-flow',
        'processmaker-modeler-end-event',
        'processmaker-modeler-error-end-event',
        'processmaker-modeler-message-end-event',
        'processmaker-modeler-lane',
        'processmaker-modeler-text-annotation',
        'processmaker-modeler-pool',
        'processmaker-modeler-association',
      ],
      style: null,
      showDropdown: false,
    };
  },
  created() {
    this.$t = this.$t.bind(this);
  },
  computed: {
    isValidMessageFlowSource() {
      return this.validMessageFlowSources.includes(this.node.type);
    },
    isFlow() {
      return [
        'processmaker-modeler-sequence-flow',
        'processmaker-modeler-message-flow',
      ].includes(this.node.type);
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

      if (!store.getters.allowSavingElementPosition) {
        return;
      }

      this.$emit('save-state');
    },
    repositionCrown() {
      const shapeView = this.shape.findView(this.paper);

      if (!shapeView) {
        return;
      }

      const { x, y, width } = shapeView.getBBox({ useModelGeometry: !this.isTextAnnotation && !this.isFlow });

      this.style = {
        top: `${y - 45}px`,
        left: `${x + width - 20}px`,
        cursor: 'pointer',
      };
    },
    paperDoneRendering() {
      if (!this.isRendering) {
        return;
      }

      new Promise(resolve => this.paper.once('render:done', resolve));
    },
    setUpCrownConfig() {
      this.paper.on('render:done scale:changed translate:changed', this.repositionCrown);
      this.shape.on('change:position change:size change:attrs', this.repositionCrown);

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
    setUpPositionHandling() {
      this.shape.on('change:position', (element, newPosition) => {
        this.node.diagram.bounds.x = newPosition.x;
        this.node.diagram.bounds.y = newPosition.y;

        if (!this.savePositionOnPointerupEventSet) {
          this.shape.listenToOnce(this.paper, 'element:pointerup', this.setNodePosition);
          this.savePositionOnPointerupEventSet = true;
        }
      });
    },
    replaceNode(event) {
      if (event.node.type === event.typeToReplaceWith) {
        this.showDropdown = false;
        return;
      }
      this.$emit('replace-node', event);
    },
  },
  async mounted() {
    await this.$nextTick();
    await this.paperDoneRendering();

    this.setUpCrownConfig();
    this.setUpPositionHandling();
    this.showDropdown = this.dropdownData.length > 0 && this.highlighted;
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
$primary-light: #fff;

$element-list-top: 2.5rem;
$element-list-left: -0.65rem;
$element-list-top-chevron: -0.2rem;
$element-list-left-chevron: 0.5rem;
$crown-top-chevron: 0.8rem;
$crown-left-chevron: 0.3rem;

$chevron-width: 1.25rem;
$chevron-height: 1.25rem;

@mixin chevron($top, $left) {
  content: '';
  background-color: $primary-color;
  width: $chevron-width;
  height: $chevron-height;
  position: absolute;
  top: $top;
  left: $left;
  z-index: -1;
  transform: rotate(45deg);
  border-radius: 1px;
}

.crown-config {
  background-color: $primary-color;
  position: absolute;
  z-index: 0;
  display: flex;
  justify-content: center;
  width: auto;
  height: 1.85rem;
  border-radius: 5px;

  &::after {
    @include chevron($crown-top-chevron, $crown-left-chevron);
  }
}

</style>
