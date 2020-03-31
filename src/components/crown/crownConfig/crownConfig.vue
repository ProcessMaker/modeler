<template>
  <div class="crown-config" :style="style" v-if="showCrown" role="menu">
    <slot />

    <association-flow-button
      :node="node"
      :moddle="moddle"
      :shape="shape"
      v-on="$listeners"
      @toggle-crown-state="showCrown = $event"
    />

    <sequence-flow-button
      :node="node"
      :sequence-flow-config="nodeRegistry['processmaker-modeler-sequence-flow']"
      :moddle="moddle"
      v-on="$listeners"
      @toggle-crown-state="showCrown = $event"
    />

    <message-flow-button
      :node="node"
      :moddle="moddle"
      :shape="shape"
      v-on="$listeners"
      @toggle-crown-state="showCrown = $event"
    />

    <crown-dropdowns
      :dropdown-data="dropdownData"
      :boundary-event-dropdown-data="boundaryEventDropdownData"
      :node="node"
      :node-registry="nodeRegistry"
      :moddle="moddle"
      :shape="shape"
      :task-dropdown-initially-open="taskDropdownInitiallyOpen"
      @replace-node-type="replaceNodeTypePrompt"
      v-on="$listeners"
    />

    <delete-button
      :graph="graph"
      :shape="shape"
      :node="node"
      v-on="$listeners"
    />

    <b-modal
      id="modal-prevent-closing"
      ref="modal"
      :title="$t('Change Type')"
      :ok-title="$t('Confirm')"
      :cancel-title="$t('Cancel')"
      v-model="showReplaceModal"
      @hidden="showReplaceModal = false"
      @ok="confirmedReplaceNodeType"
    >
      <p>{{ $t('Changing this type will replace your current configuration') }}</p>
    </b-modal>
  </div>
</template>

<script>
import DeleteButton from '@/components/crown/crownButtons/deleteButton';
import MessageFlowButton from '@/components/crown/crownButtons/messageFlowButton';
import SequenceFlowButton from '@/components/crown/crownButtons/sequenceFlowButton';
import AssociationFlowButton from '@/components/crown/crownButtons/associationFlowButton';
import CrownDropdowns from '@/components/crown/crownButtons/crownDropdowns';
import poolLaneCrownConfig from '@/mixins/poolLaneCrownConfig';
import { removeFlows } from '@/components/crown/utils.js';
import pull from 'lodash/pull';
import store from '@/store';
import isEqual from 'lodash/isEqual';
import { getDefaultNodeColors, setShapeColor } from '@/components/nodeColors';

export default {
  components: {
    CrownDropdowns,
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
      default: () => [],
    },
  },
  mixins: [poolLaneCrownConfig],
  watch: {
    'node.definition.color': {
      handler() {
        this.setNodeColor();
      },
      deep: true,
    },
    highlightedShapes(shapes, prevShapes) {
      if (isEqual(shapes, prevShapes)) {
        return;
      }

      this.showCrown = this.highlightedShapes[0] === this.shape;
    },
    highlighted(highlighted) {
      if (!highlighted) {
        this.taskDropdownInitiallyOpen = false;
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
      style: null,
      taskDropdownInitiallyOpen: this.paperNotRendered(),
      showReplaceModal: false,
      nodeToReplace: null,
    };
  },
  created() {
    this.$t = this.$t.bind(this);
  },
  computed: {
    isFlow() {
      return [
        'processmaker-modeler-sequence-flow',
        'processmaker-modeler-message-flow',
      ].includes(this.node.type);
    },
    isTextAnnotation() {
      return this.node.type === 'processmaker-modeler-text-annotation';
    },
    process() {
      return this.node.pool
        ? this.node.pool.component.containingProcess
        : this.processNode.definition;
    },
    highlightedShapes: () => store.getters.highlightedShapes,
  },
  methods: {
    setNodeColor() {
      const color = this.node.definition.get('color');
      const { fill, stroke } = getDefaultNodeColors(this.node, color);

      setShapeColor(this.shape, fill, stroke, this.node);
    },
    paperNotRendered() {
      return !this.isRendering;
    },
    removeFlows,
    replaceNodeTypePrompt(node) {
      if (this.taskDropdownInitiallyOpen) {
        this.$emit('replace-node', node);
        return;
      }
      this.showReplaceModal = true;
      this.nodeToReplace = node;
    },
    confirmedReplaceNodeType() {
      this.removeFlows(this.graph, this.shape);
      this.$emit('replace-node', this.nodeToReplace);
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
    this.setNodeColor();
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

<style lang="scss" src="./crownConfig.scss" />
