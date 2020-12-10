import component from './inclusiveGateway.vue';
import { gatewayDirection } from '../gateway/gatewayConfig';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import DocumentationFormTextArea from '@/components/inspectors/DocumentationFormTextArea';
import defaultNames from '@/components/nodes/gateway/defaultNames';

const id = 'processmaker-modeler-inclusive-gateway';

export default {
  id,
  component,
  bpmnType: 'bpmn:InclusiveGateway',
  control: false,
  category: 'BPMN',
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:InclusiveGateway', {
      name: $t(defaultNames[id]),
      gatewayDirection: gatewayDirection.diverging,
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
      }),
    });
  },
  inspectorConfig: [
    {
      name: defaultNames[id],
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'inspector-accordion-inclusive-gateway-config',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: false,
            label: 'Advanced',
            icon: 'cogs',
            name: 'inspector-accordion-inclusive-gateway-advanced',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
            {
              component: 'FormSelect',
              config: {
                label: 'Direction',
                helper: 'Select the direction of workflow for this element',
                name: 'gatewayDirection',
                options: [
                  { value: gatewayDirection.diverging, content: 'Diverging' },
                  { value: gatewayDirection.converging, content: 'Converging' },
                ],
              },
            },
            {
              component: DocumentationFormTextArea,
              config: {
                label: 'Description',
                name: 'documentation',
              },
            },
          ],
        },
      ],
    },
  ],
};
