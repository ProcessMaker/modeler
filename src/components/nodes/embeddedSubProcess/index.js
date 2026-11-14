import component from './embeddedSubProcess.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { taskHeight, taskWidth } from '@/components/nodes/task/taskConfig';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/task/defaultNames';
import { loopCharacteristicsHandler } from '@/components/inspectors/LoopCharacteristics';

export const id = 'processmaker-modeler-embedded-sub-process';

export default {
  id,
  component,
  bpmnType: 'bpmn:SubProcess',
  control: false,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/sub-task.svg'),
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:SubProcess', {
      name: $t(defaultNames[id]),
      flowElements: [],
      artifacts: [],
      loopCharacteristics: null,
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      isExpanded: false,
      bounds: moddle.create('dc:Bounds', {
        height: taskHeight,
        width: taskWidth,
      }),
    });
  },
  inspectorHandler(value, node, setNodeProp) {
    if (node.definition.get('id') !== value.id) {
      window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
        id: node.definition.id, key: 'id', value: value.id,
      });
      setNodeProp(node, 'id', value.id);
    }
    if (node.definition.get('name') !== value.name) {
      window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
        id: node.definition.id, key: 'name', value: value.name,
      });
      setNodeProp(node, 'name', value.name);
    }
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
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-embedded-subprocess',
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
  loopCharacteristicsHandler,
};
