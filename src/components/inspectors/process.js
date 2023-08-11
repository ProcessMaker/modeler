import idConfigSettings from './idConfigSettings';

const process = {
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
            label: 'Properties',
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

export const id = process.id;

export default process;
