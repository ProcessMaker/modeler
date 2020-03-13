import component from './poolLane';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';

export const id = 'processmaker-modeler-lane';
export default {
  id,
  component,
  bpmnType: 'bpmn:Lane',
  control: false,
  category: 'BPMN',
  label: 'Lane',
  definition(moddle) {
    return moddle.create('bpmn:Lane', {
      name: '',
    });
  },
  diagram: (moddle) => moddle.create('bpmndi:BPMNShape', {
    bounds: moddle.create('dc:Bounds', {
      height: 150,
      width: 600,
      x: null,
      y: null,
    }),
  }),
  inspectorConfig: [
    {
      name: 'Lane',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        advancedAccordionConfig,
      ],
    },
  ],
};
