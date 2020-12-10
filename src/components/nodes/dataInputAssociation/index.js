import component from './dataInputAssociation.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import * as config from './config';

export default {
  ...config,
  component,
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
            label: 'Configuration',
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
