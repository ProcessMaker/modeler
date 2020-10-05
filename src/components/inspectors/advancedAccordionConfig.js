import idConfigSettings from './idConfigSettings';
import DocumentationFormTextArea from './DocumentationFormTextArea';

export default {
  component: 'FormAccordion',
  container: true,
  config: {
    initiallyOpen: false,
    label: 'Advanced',
    icon: 'cogs',
    name: 'advanced-accordion',
  },
  items: [
    {
      component: 'FormInput',
      config: idConfigSettings,
    },
    {
      component: DocumentationFormTextArea,
      config: {
        label: 'Description',
        name: 'documentation',
      },
    },
  ],
};
