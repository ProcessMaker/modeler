import component from './scriptTask.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { taskHeight, taskWidth } from '@/components/nodes/task/taskConfig';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/task/defaultNames';

export const id = 'processmaker-modeler-script-task';

export default {
  id,
  component,
  bpmnType: 'bpmn:ScriptTask',
  control: false,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/scriptTask.svg'),
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:ScriptTask', {
      name: $t(defaultNames[id]),
      scriptRef: null,
      loopCharacteristics: null,
      ioSpecification: null,
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: taskHeight,
        width: taskWidth,
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
            name: 'inspector-accordion-script-task',
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
