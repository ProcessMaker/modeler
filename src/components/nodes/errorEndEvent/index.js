import component from './errorEndEvent.vue';
import endEventConfig from '../endEvent/index';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import defaultNames from '@/components/nodes/endEvent/defaultNames';

export const id = 'processmaker-modeler-error-end-event';

export default merge(cloneDeep(endEventConfig), {
  id,
  component,
  control: false,
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
      name: $t(defaultNames[id]),
      eventDefinitions: [
        moddle.create('bpmn:ErrorEventDefinition'),
      ],
    });
  },
  inspectorData(node) {
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === 'eventDefinitions') {
        data.errorName = value[0].get('errorRef').name;
      } else {
        data[key] = value;
      }

      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp) {
    for (const key in omit(value, ['$type', 'eventDefinitions', 'errorName'])) {
      if (node.definition[key] === value[key]) {
        continue;
      }
      window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
        id: node.definition.id , key, value: value[key],
      });
      setNodeProp(node, key, value[key]);
    }

    const error = node.definition.get('eventDefinitions')[0].errorRef;
    if (error.name !== value.errorName) {
      error.name = value.errorName;
      window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
        id: node.definition.id,
        key: 'eventDefinitions',
        value: node.definition.get('eventDefinitions'),
      });
    }
  },
  multiplayerInspectorHandler(node, data, setNodeProp) {
    const keys = Object.keys(data).filter((key) => key !== 'id');
    if (keys[0] === 'eventDefinitions') {
      const error = data[keys[0]][0].errorRef;
      const errorRef = node.definition.get('eventDefinitions')[0].errorRef;
      if (error && errorRef) {
        if (error.name !== errorRef.name) {
          errorRef.name = error.name;
        }
      }
      return;
    }
    setNodeProp(node, keys[0], data[keys[0]]);
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [
            {},
            {
              component: 'FormInput',
              config: {
                label: 'Error Name',
                name: 'errorName',
                helper: 'Enter the error name that is unique from all other elements in the diagram',
              },
            },
          ],
        },
      ],
    },
  ],
});
