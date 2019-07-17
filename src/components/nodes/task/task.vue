<template>
  <div/>
</template>

<script>
import joint from 'jointjs';
import connectIcon from '@/assets/connect-elements.svg';
import crownConfig from '@/mixins/crownConfig';
import TaskShape from '@/components/nodes/task/shape';
import { taskHeight } from './index';
import pull from 'lodash/pull';

const labelPadding = 15;

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      crownConfig: [
        {
          id: 'sequence-flow-button',
          title: 'Sequence Flow',
          icon: connectIcon,
          clickHandler: this.addSequence,
        },
      ],
    };
  },
  watch: {
    'node.definition.name'(name) {
      const { width } = this.node.diagram.bounds;
      this.shape.attr('label/text', joint.util.breakText(name, { width }));

      /* Update shape height if label text overflows */
      const labelHeight = this.shapeView.selectors.label.getBBox().height;
      const { height } = this.shape.size();

      if (labelHeight + labelPadding !== height) {
        const newHeight = Math.max(labelHeight + 15, taskHeight);
        this.node.diagram.bounds.height = newHeight;
        this.shape.resize(width, newHeight);
      }
    },
  },
  methods: {
    getElementsUnderArea(element) {
      const { x, y, width, height} = element.getBBox();
      const area = { x, y, width, height };

      return this.graph.findModelsInArea(area);
    },
    addToTask(element) {
      // this.shape.unembed(element);
      this.shape.embed(element);
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
        text: joint.util.breakText(this.node.definition.get('name'), { width: bounds.width }),
        fill: 'black',
      },
    });

    this.shape.addTo(this.graph);
    this.shape.component = this;

    let draggingElement;
    let newTask;
    let task;

    this.shape.listenTo(this.graph, 'change:position', (element) => {
      task = this.getElementsUnderArea(element).find(model => {
        return model.component && model.component.node.type === 'processmaker-modeler-task';
      });

      if (!task) {
        return;
      }

      newTask = task !== this.shape
        ? newTask
        : null;
    });

    this.shape.listenTo(this.paper, 'cell:pointerdown', cellView => {
      if (
        (!draggingElement || draggingElement !== cellView.model) &&
        cellView.model.component && !['processmaker-modeler-task'].includes(cellView.model.component.node.type)
      ) {
        draggingElement = cellView.model;
      }
    });



    this.shape.listenTo(this.paper, 'cell:pointerup', cellView => {
      // if (!this.isPoolChild(cellView.model)) {
      //   return;
      // }

      if (!draggingElement || draggingElement !== cellView.model) {
        return;
      }

      this.shape.embed(draggingElement);

      draggingElement = null;
    });
  },
};
</script>
