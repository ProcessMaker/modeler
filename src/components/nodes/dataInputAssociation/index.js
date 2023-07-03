import idConfigSettings from '@/components/inspectors/idConfigSettings';
import * as config from './config';

export default {
  ...config,
  component: () => import('./dataInputAssociation.vue'),
  control: false,
  inspectorConfig: [
    {
      name: 'Data Input Association',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-data-input-association',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
          ],
        },
      ],
    },
  ],
};
