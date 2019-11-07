<template>
  <div>
    <div v-if="showCrown" class="crown-config">
      <font-awesome-icon class="crown-config__icon" :icon="trashIcon"  @click="removeShape()"/>
    </div>
  </div>
</template>

<script>
import { util } from 'jointjs';
import connectIcon from '@/assets/connect-elements.svg';
import crownConfig from '@/mixins/crownConfig';
import portsConfig from '@/mixins/portsConfig';
import hasMarkers from '@/mixins/hasMarkers';
import {markerSize} from '@/mixins/hasMarkers';
import TaskShape from '@/components/nodes/task/shape';
import { taskHeight } from './taskConfig';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const labelPadding = 15;
const topAndBottomMarkersSpace = 2 * markerSize;

export default {
  components: {
    FontAwesomeIcon,
  },
  props: ['graph', 'node', 'id', 'highlighted'],
  mixins: [crownConfig, portsConfig, hasMarkers, hideLabelOnDrag],
  data() {
    return {
      shape: null,
      definition: null,
      showCrown: false,
      crownConfig: [
        {
          id: 'sequence-flow-button',
          title: this.$t('Sequence Flow'),
          icon: connectIcon,
          clickHandler: this.addSequence,
        },
      ],
    };
  },
  computed: {
    hasTaskMarker() {
      return this.shape.attr('image/xlink:href') ? true : false;
    },
    trashIcon() {
      return faTrash;
    },
  },
  watch: {
    highlighted(isHighlighted) {
      isHighlighted ? this.showCrown = true : this.showCrown = false;
    },
    'node.definition.name'(name) {
      const { width } = this.node.diagram.bounds;
      this.shape.attr('label/text', util.breakText(name, { width }));

      /* Update shape height if label text overflows */
      const labelHeight = this.shapeView.selectors.label.getBBox().height;
      const { height } = this.shape.size();

      if (labelHeight + labelPadding + topAndBottomMarkersSpace !== height) {
        const newHeight = Math.max(labelHeight + labelPadding + topAndBottomMarkersSpace, taskHeight);
        this.node.diagram.bounds.height = newHeight;
        this.shape.resize(width, newHeight);
        this.recalcMarkersAlignment();
      }
    },
  },
  methods: {
    getElementsUnderArea(element) {
      const { x, y, width, height} = element.getBBox();
      const area = { x, y, width, height };

      return this.graph.findModelsInArea(area);
    },
    removeShape() {
      this.graph.getConnectedLinks(this.shape).forEach(shape => this.$emit('remove-node', shape.component.node));
      this.shape.getEmbeddedCells({deep: true}).forEach(cell => {
        if (cell.component) {
          this.graph.getConnectedLinks(cell).forEach(shape => this.$emit('remove-node', shape.component.node));
          this.shape.unembed(cell);
          this.$emit('remove-node', cell.component.node);
        }
      });

      this.$emit('remove-node', this.node);
    },
  },
  mounted() {
    this.shape = new TaskShape();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.attr({
      body: {
        rx: 8,
        ry: 8,
      },
      label: {
        text: util.breakText(this.node.definition.get('name'), { width: bounds.width }),
        fill: 'black',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
  },
};
</script>
<style lang="scss">
$icon-color: #fff;
$primary-color: #5096db;

.crown-config{
  background-color: $primary-color;
  position: absolute;
  top: 10rem;
  right: 10rem;
  z-index: 5;
  display: flex;
  justify-content: center;
  width: auto;
  height: 1.65rem;
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
    color: $icon-color;
  }
}
</style>
