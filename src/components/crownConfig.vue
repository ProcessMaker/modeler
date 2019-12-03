<template>
  <div class="crown-config" :style="style" v-if="showCrown">
    <slot/>
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

    <div class="cog-container" role="menubar">
      <button class="cog-container--button" @click="dropdownOpen = !dropdownOpen">
        <i class="fas fa-cog"/>
      </button>

      <ul class="element-list" v-if="dropdownOpen" role="list">
        <li class="element-list--item" role="listitem">
          <button
            data-test="switch-to-start-timer-event"
            class="element-list--item__button"
            type="button"
            @click="$emit('replace-node', { node, typeToReplaceWith: 'processmaker-modeler-start-timer-event' })"
          >{{ $t('Start Timer Event') }}
          </button>
        </li>

        <li class="element-list--item" role="listitems">
          <button
            data-test="switch-to-message-start-event"
            class="element-list--item__button"
            type="button"
            @click="$emit('replace-node', { node, typeToReplaceWith: 'processmaker-modeler-message-start-event' })"
          >{{ $t('Message Start Event') }}
          </button>
        </li>
      </ul>
    </div>

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
import store from '@/store';

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
      dropdownOpen: true,
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
  },
  async mounted() {
    await this.$nextTick();
    await this.paperDoneRendering();

    this.setUpCrownConfig();
    this.setUpPositionHandling();
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

    &__icon {
      margin: 5px 10px;
      font-size: 1rem;
    }
  }

  .cog-container {
    position: relative;
    display: flex;

    &--button {
      background: none;
      border: none;
      color: $primary-light;
      padding: 0;
      position: relative;
    }
  }

  .element-list {
    position: absolute;
    white-space: nowrap;
    top: $element-list-top;
    left: $element-list-left;
    border-radius: 5px;
    background-color: $primary-color;
    padding: 0;

    &::after {
      @include chevron($element-list-top-chevron, $element-list-left-chevron);
    }

    &--item {
      list-style: none;

      &__button {
        background: none;
        padding: 0.25rem 0.85rem;
        border: none;
        color: $primary-light;
        font-size: 0.85rem;
      }
    }
  }
</style>
