import component from './dataOutputAssociation.vue';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import * as config from './config';

export default {
  ...config,
  component,
  control: false,
  inspectorConfig: [
    {
      name: 'Data Output Association',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion-data-output-association',
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
