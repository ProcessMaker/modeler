import component from './errorEndEvent.vue';
import endEventConfig from '../endEvent/index';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';

export const id = 'processmaker-modeler-boundary-error-event';

export default merge(cloneDeep(endEventConfig), {
  id,
  component,
  control: true,
  label: 'Error End Event',
  icon: require('@/assets/toolpanel/boundary-error-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:EndEvent', {
      name: $t('New Error End Event'),
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

      setNodeProp(node, key, value[key]);
    }

    const message = node.definition.get('eventDefinitions')[0].errorRef;
    if (message.name !== value.messageName) {
      message.name = value.messageName;
    }
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
              },
            },
          ],
        },
      ],
    },
  ],
});
