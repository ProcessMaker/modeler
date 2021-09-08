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
      :iconName="this.iconName"
      @set-custom-icon-name="setCustomIconName"
      @reset-custom-icon-name="resetCustomIconName"
      v-on="$listeners"
    />

    <b-modal ref="subprocess-modal" :title="`Previewing '${subprocessName}'`">
      <div v-if="subProcessSvg" v-html="subProcessSvg" class="text-center" />
      <div v-else-if="failedToLoadPreview">Could not load preview</div>
      <div v-else><i class="fas fa-spinner fa-spin"/> Loading process preview...</div>

      <template #modal-footer>
        <a :href="subprocessLink" target="_blank" data-test="modal-process-link">
          Open subprocess in new window
          <i class="ml-1 fas fa-external-link-alt"/>
        </a>
      </template>
    </b-modal>

    <b-modal ref="no-subprocess-modal" title="No subprocess selected" :hide-footer="true">
      Please select a subprocess to view it.
    </b-modal>
  </div>
</template>

<script>
import { util } from 'jointjs';
import portsConfig from '@/mixins/portsConfig';
import TaskShape from '@/components/nodes/task/shape';
import { taskHeight } from '@/components/nodes/task/taskConfig';
import store from '@/store';
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

const labelPadding = 15;
const topAndBottomMarkersSpace = 2 * markerSize;
const blankDefaultIcon = '<svg version="1.1"\n' +
    '     baseProfile="full"\n' +
    '     width="16" height="16"\n' +
    '     xmlns="http://www.w3.org/2000/svg"></svg>';

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
    'paperManager',
  ],
  mixins: [highlightConfig, portsConfig, hasMarkers, hideLabelOnDrag, updateIconColor, customIcon],
  data() {
    return {
      subProcessSvg: null,
      failedToLoadPreview: false,
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
          dataTest: 'switch-to-sub-process',
        },
      ],
      nodeIcon: blankDefaultIcon,
      iconName: '',
      anchorPointFunction: getRectangleAnchorPoint,
    };
  },
  computed: {
    subprocessId() {
      return JSON.parse(this.node.definition.get('config')).processId;
    },
    subprocessLink() {
      return `/modeler/${this.subprocessId}`;
    },
    subprocessName() {
      return this.node.definition.get('name');
    },
  },
  watch: {
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
    'node.definition.config'(config) {
      store.commit('updateNodeProp', {
        node: this.node,
        key: 'config',
        value: config,
      });
      this.$emit('save-state');
    },
    'node.definition.callActivityType'(callActivityType) {
      this.shape.attr('image/display', callActivityType === 'globalTask' ? 'none' : 'initial');
    },
    'node.definition.loopCharacteristics'() {
      setupLoopCharacteristicsMarkers(this.node.definition, this.markers, this.$set, this.$delete);
    },
  },
  methods: {
    clickSubprocess(shapeView, event) {
      const isPlusMarkerTheTarget = event.target.getAttribute('joint-selector') === 'bottomCenter.0';
      const isItThisShape = shapeView.model === this.shape;

      if (!isPlusMarkerTheTarget || !isItThisShape) {
        return;
      }

      if (!this.subprocessId) {
        this.$refs['no-subprocess-modal'].show();
        return;
      }

      this.$refs['subprocess-modal'].show();

      this.subProcessSvg = null;
      this.failedToLoadPreview = false;

      window.ProcessMaker.apiClient.get(`/processes/${this.subprocessId}`, { params: { include: 'svg' } })
        .then(({ data }) => {
          if (!data.svg) {
            this.failedToLoadPreview = true;
            return;
          }
          const removeWidthAttribute = (svgString) => svgString.replace('<svg width="100%"', '<svg ');
          const insertBorder = (svgString) => svgString.replace('<svg ', '<svg class="border border-dark"');

          this.subProcessSvg = insertBorder(removeWidthAttribute(data.svg));
        })
        .catch(() => {
          this.failedToLoadPreview = true;
        });
    },
  },
  mounted() {
    this.shape = new TaskShape();
    this.$set(this.markers.bottomCenter, 'subprocess', subprocessIcon);
    let bounds = this.node.diagram.bounds;
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
    this.paperManager.addEventHandler('element:pointerclick', this.clickSubprocess);
    if (this.node.definition.get('customIcon')) {
      this.setCustomIcon(this.node.definition.get('customIcon'));
    }
  },
};
</script>
