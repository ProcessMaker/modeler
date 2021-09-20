import component from './manualTask.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/task/defaultNames';

export const taskHeight = 76;
export const id = 'processmaker-modeler-manual-task';

export default {
  id,
  component,
  bpmnType: 'bpmn:ManualTask',
  control: false,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/manualTask.svg'),
  label: defaultNames[id],
  loopInspectorIndex: 1,
  definition(moddle, $t) {
    return moddle.create('bpmn:ManualTask', {
      name: $t(defaultNames[id]),
      assignment: 'requester',
      loopCharacteristics: null,
      ioSpecification: null,
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: taskHeight,
        width: 116,
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
            name: 'inspector-accordion-manual-task',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
};
