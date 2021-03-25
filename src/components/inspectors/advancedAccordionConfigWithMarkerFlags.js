import idConfigSettings from './idConfigSettings';
import MarkerFlags from '@/components/inspectors/MarkerFlags';

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
