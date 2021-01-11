import Task from '@/components/nodes/task/task';
import testIcon from '@/assets/connect-artifacts.svg';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerNode }) => {
  /* Add a custom node example */

  const implementation = 'test-message';
  const nodeId = 'connectors-test-message';

  const component = {
    extends: Task,
    mounted() {
      this.shape.attr('image/xlink:href', testIcon);
    },
  };

  const nodeType = {
    id: nodeId,
    component,
    bpmnType: 'bpmn:ServiceTask',
    control: true,
    category: 'Social',
    icon: require('@/assets/toolpanel/task.svg'),
    label: 'Test',
    implementation,
    definition(moddle) {
      return moddle.create('bpmn:ServiceTask', {
        name: 'Test Connector',
        implementation,
        config: JSON.stringify({ testMessage: '' }),
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
    /* Map values from inspector data to node definition  */
    inspectorHandler(value, node, setNodeProp) {
      // Go through each property and rebind it to our data
      const definition = node.definition;
      const config = JSON.parse(definition.config);

      for (const key in value) {
        if (key in config) {
          config[key] = value[key];
        } else if (definition[key] !== value[key]) {
          setNodeProp(node, key, value[key]);
        }
      }

      const newConfig = JSON.stringify(config);
      if (newConfig !== definition.config) {
        setNodeProp(node, 'config', newConfig);
      }
    },
    /* Map values from node definition to inspector data */
    inspectorData(node) {
      return Object.entries(node.definition).reduce((data, [key, value]) => {
        if (key === 'config') {
          try {
            const config = JSON.parse(value);
            return { ...data, ...config };
          } catch (error) {
            /* Ignore invalid JSON */
          }
        }

        data[key] = value;
        return data;
      }, {});
    },
    inspectorConfig: [
      {
        name: 'Test Connector',
        items: [
          {
            component: 'FormText',
            config: {
              label: 'Test Connector',
              fontSize: '2em',
            },
          },
          {
            component: 'FormInput',
            config: idConfigSettings,
          },
          {
            component: 'FormTextArea',
            config: {
              label: 'Test Message',
              helper: 'The Body of The Message to Send',
              name: 'testMessage',
              defaultValue: { mode: 'basic', value: '' },
            },
          },
        ],
      },
    ],
  };

  registerNode(nodeType);
});
