
import component from './endEvent.vue';

export default {
  id: 'processmaker-modeler-end-event',
  component,
  bpmnType: 'bpmn:EndEvent',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/end-event.svg'),
  label: 'End Event',
  definition(moddle) {
    return moddle.create('bpmn:EndEvent', {
      name: 'End Event',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
        x: null,
        y: null,
      }),
    });
  },
  /**
   * Validate whether to accept an outgoing flow to the node
   *
   * @param node
   */
  validateOutgoing() {
    return false;
  },
  inspectorConfig: [
    {
      name: 'End Event',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'End Event',
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
            helper: 'The Name of the End Event',
            name: 'name',
          },
        },
      ],
    },
  ],
};
