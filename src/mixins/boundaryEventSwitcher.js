import { id as taskId } from '@/components/nodes/task';
import { id as subProcessId } from '@/components/nodes/subProcess';
import { id as manualTaskId } from '@/components/nodes/manualTask';
import { id as scriptTaskId } from '@/components/nodes/scriptTask';
import { boundaryTimerEvent, intermediateTimerEvent } from '@/components/nodes';

export default {
  props: ['graph', 'paper', 'node', 'moddle'],
  methods: {
    getTaskUnderShape() {
      const taskIds = [
        taskId,
        subProcessId,
        manualTaskId,
        scriptTaskId,
      ];

      return this.graph
        .findModelsUnderElement(this.shape)
        .filter(model => model.component)
        .find(model => taskIds.includes(model.component.node.type));
    },
    addTimerEvent() {
      const definition = intermediateTimerEvent.definition(this.moddle, this.$t);
      const diagram = intermediateTimerEvent.diagram(this.moddle);

      diagram.bounds.x = this.node.diagram.bounds.x;
      diagram.bounds.y = this.node.diagram.bounds.y;

      this.$emit('add-node', {
        definition,
        diagram,
        type: intermediateTimerEvent.id,
      });
    },
    addBoundaryEvent() {
      const definition = boundaryTimerEvent.definition(this.moddle, this.$t);

      const diagram = boundaryTimerEvent.diagram(this.moddle);
      const task = this.getTaskUnderShape();

      diagram.bounds.x = this.node.diagram.bounds.x;
      diagram.bounds.y = this.node.diagram.bounds.y;

      definition.set('attachedToRef', task.component.node.definition);
      definition.set('cancelActivity', true);

      this.$emit('add-node', {
        definition,
        diagram,
        type: boundaryTimerEvent.id,
      });
    },
    addBoundaryOrTimerEvent() {
      const task = this.getTaskUnderShape();
      const selfIsBoundaryEvent = this.node.type === boundaryTimerEvent.id;

      if (
        (selfIsBoundaryEvent && task) ||
        (!selfIsBoundaryEvent && !task)
      ) {
        return;
      }

      this.$nextTick(() => {
        this.$emit('remove-node', this.node);
      });

      if (selfIsBoundaryEvent) {
        this.addTimerEvent();
      } else {
        this.addBoundaryEvent();
      }
    },
    pointerupOverSelf(cellView) {
      if (cellView.model !== this.shape) {
        return;
      }

      this.addBoundaryOrTimerEvent();
    },
  },
  async mounted() {
    await this.$nextTick();
    this.shape.listenTo(this.paper, 'element:pointerup', this.pointerupOverSelf);
  },
};
