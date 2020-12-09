import idConfigSettings from './idConfigSettings';

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
            name: 'inspector-accordion-process',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
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
