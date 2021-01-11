import Task from '@/components/nodes/task/task';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerNode }) => {
  /* Add a custom node example */

  const implementation = 'processmaker-social-twitter-send';
  const nodeId = 'processmaker-connectors-social-twitter-send';

  const component = {
    extends: Task,
  };

  const nodeType = {
    id: nodeId,
    component,
    bpmnType: 'bpmn:ServiceTask',
    control: true,
    category: 'Social',
    icon: require('@/assets/toolpanel/task.svg'),
    label: 'Send Tweet',
    implementation,
    definition(moddle) {
      return moddle.create('bpmn:ServiceTask', {
        name: 'Send Tweet',
        implementation,
        config: JSON.stringify({ tweet: '' }),
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
            component: 'FormTextArea',
            config: {
              label: 'Tweet Body',
              helper: 'The Body Of The Tweet to Send',
              name: 'tweet',
              defaultValue: { mode: 'basic', value: '' },
            },
          },
        ],
      },
    ],
  };

  registerNode(nodeType);
});
