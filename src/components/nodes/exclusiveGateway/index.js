import component from './exclusiveGateway.vue';

export const gatewayDirectionOptions = { Diverging: 'Diverging', Converging: 'Converging' };

export default {
  id: 'processmaker-modeler-exclusive-gateway',
  component,
  bpmnType: 'bpmn:ExclusiveGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/exclusive-gateway.svg'),
  label: 'Exclusive Gateway',
  definition(moddle) {
    return moddle.create('bpmn:ExclusiveGateway', {
      name: 'New Exclusive Gateway',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Exclusive Gateway',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Exclusive Gateway',
            fontSize: '2em',
          },
        },
        {
          component: 'FormInput',
          config: {
            label: 'Identifier',
            helper: 'The id field should be unique across all elements in the diagram',
            name: 'id',
          },
        },
        {
          component: 'FormInput',
          config: {
            label: 'Name',
            helper: 'The Name of the Gateway',
            name: 'name',
          },
        },
      ],
    },
  ],
};
