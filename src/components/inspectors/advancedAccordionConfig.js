import idConfigSettings from './idConfigSettings';
import NodeIdentifierInput from './NodeIdentifierInput';

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
      component: NodeIdentifierInput,
      config: idConfigSettings,
    },
  ],
};
