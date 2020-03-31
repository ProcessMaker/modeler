import Task from '@/components/nodes/task/task';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import bookIcon from '!!url-loader!@/assets/book.svg';
import clockIcon from '!!url-loader!@/assets/clock.svg';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerNode }) => {
  /* Add a custom node example */

  const implementation = 'processmaker-custom-marker-task-test';
  const nodeId = 'processmaker-custom-marker-task-test';

  const component = {
    extends: Task,
    watch: {
      'node.definition.name'(name) {
        switch (name) {
          case 'Task with Marker':
            this.$set(this.markers.topRight, 'vocabulary', bookIcon);
            this.$delete(this.markers.topRight, 'clock');
            break;
          case 'Task with two Markers':
            this.$set(this.markers.topRight, 'vocabulary', bookIcon);
            this.$set(this.markers.topRight, 'clock', clockIcon);
            break;
          default:
            this.$delete(this.markers.topRight, 'vocabulary');
            this.$delete(this.markers.topRight, 'clock');
        }
      },
    },
    mounted() {
      this.$set(this.markers.topRight, 'vocabulary', bookIcon);
    },
  };

  const nodeType = {
    id: nodeId,
    component,
    bpmnType: 'bpmn:ScriptTask',
    control: true,
    category: 'Other',
    icon: require('@/assets/toolpanel/task.svg'),
    label: 'Task with Marker',
    definition(moddle) {
      return moddle.create('bpmn:ScriptTask', {
        name: 'Task with Marker',
        implementation,
        config: JSON.stringify({}),
      });
    },
    diagram(moddle) {
      return moddle.create('bpmndi:BPMNShape', {
        bounds: moddle.create('dc:Bounds', {
          height: 76,
          width: 116,
        }),
      });
    },
    inspectorConfig: [
      {
        name: 'Send Tweet',
        items: [
          {
            component: 'FormText',
            config: {
              label: 'Send Tweet',
              fontSize: '2em',
            },
          },
          {
            component: 'FormInput',
            config: idConfigSettings,
          },
          {
            component: 'FormInput',
            config: {
              label: 'Name',
              helper: 'Name',
              name: 'name',
            },
          },
        ],
      },
    ],
  };

  registerNode(nodeType, definition => {
    if (definition.get('implementation') === implementation) {
      return nodeId;
    }
  });
});
