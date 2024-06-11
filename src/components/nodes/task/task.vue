<template>
  <crown-config
    :highlighted="highlighted"
    :paper="paper"
    :graph="graph"
    :shape="shape"
    :node="node"
    :nodeRegistry="nodeRegistry"
    :moddle="moddle"
    :collaboration="collaboration"
    :process-node="processNode"
    :plane-elements="planeElements"
    :is-rendering="isRendering"
    :boundary-event-dropdown-data="boundaryEventDropdownData"
    :dropdown-data="dropdownData"
    :hide-color-dropdown="hideColorDropdown"
    :showCustomIconPicker="true"
    :iconName="this.iconName"
    @set-custom-icon-name="setCustomIconName"
    @reset-custom-icon-name="resetCustomIconName"
    v-on="$listeners"
  />
</template>

<script>
import debounce from 'lodash/debounce';
import { util } from 'jointjs';
import highlightConfig from '@/mixins/highlightConfig';
import portsConfig from '@/mixins/portsConfig';
import hasMarkers, { markerSize } from '@/mixins/hasMarkers';
import TaskShape from '@/components/nodes/task/shape';
import { taskHeight } from './taskConfig';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import customIcon from '@/mixins/customIcon';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import { gridSize } from '@/graph';
import defaultNames from '@/components/nodes/task/defaultNames';
import boundaryEventDropdownData from '@/components/nodes/boundaryEvent/boundaryEventDropdownData';
import setupLoopCharacteristicsMarkers from '@/components/nodes/task/setupMultiInstanceMarkers';
import setupCompensationMarker from '@/components/nodes/task/setupCompensationMarker';
import { getRectangleAnchorPoint } from '@/portsUtils';

const labelPadding = 15;
const topAndBottomMarkersSpace = 2 * markerSize;

export default {
  components: {
    CrownConfig,
  },
  props: [
    'graph',
    'node',
    'id',
    'highlighted',
    'nodeRegistry',
    'moddle',
    'paper',
    'collaboration',
    'processNode',
    'planeElements',
    'isRendering',
  ],
  mixins: [highlightConfig, portsConfig, hasMarkers, hideLabelOnDrag, customIcon],
  data() {
    return {
      shape: null,
      definition: null,
      dropdownData: [
        {
          label: defaultNames['processmaker-modeler-task'],
          nodeType: 'processmaker-modeler-task',
          dataTest: 'switch-to-user-task',
        },
        {
          label: defaultNames['processmaker-modeler-manual-task'],
          nodeType: 'processmaker-modeler-manual-task',
          dataTest: 'switch-to-manual-task',
        },
        {
          label: defaultNames['processmaker-modeler-script-task'],
          nodeType: 'processmaker-modeler-script-task',
          dataTest: 'switch-to-script-task',
        },
        {
          label: defaultNames['processmaker-modeler-call-activity'],
          nodeType: 'processmaker-modeler-call-activity',
          dataTest: 'switch-to-sub-process',
        },
      ],
      boundaryEventDropdownData,
      anchorPointFunction: getRectangleAnchorPoint,
      hideColorDropdown:false,
    };
  },
  computed: {
    hasTaskMarker() {
      return !!this.shape.attr('image/xlink:href');
    },
  },
  watch: {
    'node.definition.name': debounce(function(name) {
      const { width } = this.node.diagram.bounds;
      this.shape.attr('label/text', util.breakText(name, { width }));
      const { height } = this.shape.size();

      const heightByGrid = this.calculateSizeOnGrid();
      const newHeight = this.useTaskHeight(heightByGrid) ? taskHeight : heightByGrid;
      if (height !== newHeight) {
        this.node.diagram.bounds.height = newHeight;
        this.shape.resize(width, newHeight);
        this.recalcMarkersAlignment();
      }
    }, 300),
    'node.definition.isForCompensation'() {
      setupCompensationMarker(this.node.definition, this.markers, this.$set, this.$delete);
    },
    'node.definition': {
      deep: true,
      handler() {
        setupLoopCharacteristicsMarkers(this.node.definition, this.markers, this.$set, this.$delete);
        this.$emit('definition-changed', this.node.definition);
      },
    },
  },
  methods: {
    getElementsUnderArea(element) {
      const { x, y, width, height } = element.getBBox();
      const area = { x, y, width, height };

      return this.graph.findModelsInArea(area);
    },
    calculateSizeOnGrid() {
      const taskGridDifference = gridSize - (taskHeight % gridSize);
      const labelHeight = Math.floor(this.shapeView.selectors.label.getBBox().height);
      const labelSpace = labelHeight + labelPadding + topAndBottomMarkersSpace;
      let newHeight = this.paperManager.ceilToNearestGridMultiple(labelSpace) - taskGridDifference;
      if (this.middleIsOddNumber(newHeight)) {
        newHeight += gridSize;
      }
      return newHeight;
    },
    useTaskHeight(height) {
      return height < taskHeight || !this.node.definition.name;
    },
    middleIsOddNumber(value) {
      return Math.abs((value / 2) % 2) === 1;
    },
  },
  mounted() {
    this.shape = new TaskShape();
    let bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    setupCompensationMarker(this.node.definition, this.markers, this.$set, this.$delete);
    setupLoopCharacteristicsMarkers(this.node.definition, this.markers, this.$set, this.$delete);
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

    const docElement = this.node?.definition?.documentation;
    const doc = Array.isArray(docElement)
      ? (docElement[0].text ?? '').trim()
      : (docElement ?? '').trim();

    const view = this.paper.findViewByModel(this.shape);

    // TODO try to avoid the interval
    //view.$('circle').css('display', 'none');

    view.model.attr({
      doccircle: {
        display:'none',
      },
      doclabel: {
        display: 'none',
        text:this._uid,
        'ref-x': (95 - String(this._uid).length * 2),
      },
    });

    const interval = window.setInterval(() => {
      if (view.$('circle').length > 0) {
        view.model.attr({
          doccircle: {
            display:(doc ? 'block' : 'none'),
          },
          doclabel: {
            display: 'none',
          },
        });
        clearInterval(interval);
      }
    }, 200);
  },
};
</script>
