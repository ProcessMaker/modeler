import idConfigSettings from './idConfigSettings';
import MarkerFlags from '@/components/inspectors/MarkerFlags';
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
    {
      component: MarkerFlags,
      name: 'taskMarkers',
      config: {
        label: 'Marker Flags',
        name: 'markerFlags',
        style: 'display:none',
      },
    },
  ],
};
