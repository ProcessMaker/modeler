import idConfigSettings from './idConfigSettings';
import NodeIdentifier from './NodeIdentifier';

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
      component: NodeIdentifier,
      config: idConfigSettings,
    },
  ],
};
