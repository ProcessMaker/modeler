export default {
  id: 'processmaker-modeler-process',
  bpmnType: 'bpmn:Process',
  control: false,
  label: 'Process',
  inspectorConfig: [
    {
      name: 'Process Information',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'confifuration',
          },
          items: [
            {
              component: 'FormInput',
              config: {
                label: 'Identifier',
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'id',
                validation: ['required', 'regex:/^[a-zA-Z][^\\s][a-zA-Z0-9_]+$/'],
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The Name of the Process',
                name: 'name',
                placeholder: '',
              },
            },
          ],
        },
      ],
    },
  ],
};
