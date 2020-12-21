import idConfigSettings from './idConfigSettings';

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
  ],
};
