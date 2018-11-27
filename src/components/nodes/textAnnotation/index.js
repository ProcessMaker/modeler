import component from './textAnnotation.vue';

export default {
  id: 'processmaker-modeler-text-annotation',
  component,
  bpmnType: 'bpmn:TextAnnotation',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/text-annotation.svg'),
  label: 'Text Annotation',
  definition(moddle) {
    return moddle.create('bpmn:TextAnnotation', {
      text: 'New Text Annotation',
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 30,
        width: 150,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Text Annotation',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Text Annotation',
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
            label: 'Annotation Description',
            helper: 'Body of the text annotation',
            text: 'text',
            placeholder: 'New Text Annotation',
          },
        },
      ],
    },
  ],
};
