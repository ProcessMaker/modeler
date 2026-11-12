<template>
  <div>
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
      :showCustomIconPicker="true"
      :iconName="iconName"
      @set-custom-icon-name="setCustomIconName"
      @reset-custom-icon-name="resetCustomIconName"
      v-on="$listeners"
    >
      <edit-embedded-sub-process-button @edit="enterSubProcess" />
    </crown-config>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import { util } from 'jointjs';
import portsConfig from '@/mixins/portsConfig';
import TaskShape from '@/components/nodes/task/shape';
import { taskHeight } from '@/components/nodes/task/taskConfig';
import hasMarkers, { markerSize } from '@/mixins/hasMarkers';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';
import defaultNames from '@/components/nodes/task/defaultNames';
import boundaryEventDropdownData from '@/components/nodes/boundaryEvent/boundaryEventDropdownData';
import subprocessIcon from '@/assets/subprocess.svg';
import updateIconColor from '@/mixins/updateIconColor';
import customIcon from '@/mixins/customIcon';
import { getRectangleAnchorPoint } from '@/portsUtils';
import setupLoopCharacteristicsMarkers from '@/components/nodes/task/setupMultiInstanceMarkers';
import documentingIcons from '@/mixins/documentingIcons';
import EditEmbeddedSubProcessButton from '@/components/crown/crownButtons/editEmbeddedSubProcessButton.vue';

const labelPadding = 15;
const topAndBottomMarkersSpace = 2 * markerSize;
const blankDefaultIcon = '<svg version="1.1"\n' +
    '     baseProfile="full"\n' +
    '     width="16" height="16"\n' +
    '     xmlns="http://www.w3.org/2000/svg"></svg>';

export default {
  components: {
    CrownConfig,
    EditEmbeddedSubProcessButton,
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
    'paperManager',
  ],
  mixins: [highlightConfig, portsConfig, hasMarkers, hideLabelOnDrag, updateIconColor, customIcon, documentingIcons],
  data() {
    return {
      boundaryEventDropdownData,
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
          dataTest: 'switch-to-call-activity',
        },
      ],
      nodeIcon: blankDefaultIcon,
      iconName: '',
      anchorPointFunction: getRectangleAnchorPoint,
    };
  },
  watch: {
    'node.definition.name': debounce(function(name) {
      const { width } = this.node.diagram.bounds;
      this.shape.attr('label/text', util.breakText(name, { width }));

      const labelHeight = this.shapeView.selectors.label.getBBox().height;
      const { height } = this.shape.size();

      if (labelHeight + labelPadding + topAndBottomMarkersSpace !== height) {
        const newHeight = Math.max(labelHeight + labelPadding + topAndBottomMarkersSpace, taskHeight);
        this.node.diagram.bounds.height = newHeight;
        this.shape.resize(width, newHeight);
        this.recalcMarkersAlignment();
      }
    }, 300),
    'node.definition.loopCharacteristics'() {
      setupLoopCharacteristicsMarkers(this.node.definition, this.markers, this.$set, this.$delete);
    },
  },
  methods: {
    enterSubProcess() {
      this.$emit('enter-sub-process', this.node);
    },
    clickSubprocessMarker(shapeView, event) {
      const isPlusMarkerTheTarget = event.target.getAttribute('joint-selector') === 'bottomCenter.0';
      const isItThisShape = shapeView.model === this.shape;

      if (!isPlusMarkerTheTarget || !isItThisShape) {
        return;
      }

      this.enterSubProcess();
    },
    openEditorOnDoubleClick(shapeView) {
      if (shapeView.model === this.shape) {
        this.enterSubProcess();
      }
    },
  },
  mounted() {
    this.shape = new TaskShape();
    this.$set(this.markers.bottomCenter, 'subprocess', subprocessIcon);
    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    setupLoopCharacteristicsMarkers(this.node.definition, this.markers, this.$set, this.$delete);
    this.shape.attr({
      body: {
        rx: 8,
        ry: 8,
        strokeWidth: 4,
      },
      label: {
        text: util.breakText(this.node.definition.get('name'), { width: bounds.width }),
        fill: 'black',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;
    this.paperManager.addEventHandler('element:pointerclick', this.clickSubprocessMarker);
    this.paperManager.addEventHandler('element:pointerdblclick', this.openEditorOnDoubleClick);
    if (this.node.definition.get('customIcon')) {
      this.setCustomIcon(this.node.definition.get('customIcon'));
    }

    this.initDocumentingIcons({ labelX: '100px', labelY: '-4px' });
  },
};
</script>
