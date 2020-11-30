import component from './task.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { taskHeight, taskWidth } from './taskConfig';
import defaultNames from '@/components/nodes/task/defaultNames';
import advancedAccordionConfigWithMarkerFlags from '@/components/inspectors/advancedAccordionConfigWithMarkerFlags';
import omit from 'lodash/omit';

export const id = 'processmaker-modeler-task';

export default {
  id: 'processmaker-modeler-task',
  component,
  bpmnType: ['bpmn:Task', 'bpmn:UserTask', 'bpmn:GlobalTask', 'bpmn:SubProcess'],
  control: true,
  category: 'BPMN',
  rank: 4,
  icon: require('@/assets/toolpanel/task.svg'),
  label: 'Task',
  definition(moddle, $t) {
    return moddle.create('bpmn:Task', {
      name: $t(defaultNames[id]),
      assignment: 'requester',
      isForCompensation: false,
      loopCharacteristics: null,
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
  inspectorHandler(value, node, setNodeProp, moddle, definitions, defaultInspectorHandler) {
    if (value.markerFlags) {
      if (value.markerFlags.loopCharacteristics) {
        if (value.markerFlags.loopCharacteristics === 'no_loop') {
          setNodeProp(node, 'loopCharacteristics', null);
        }

        const currentLoopCharacteristics = node.definition.get('loopCharacteristics') || {};
        if (value.markerFlags.loopCharacteristics === 'loop' && currentLoopCharacteristics.$type !== 'bpmn:StandardLoopCharacteristics') {
          setNodeProp(node, 'loopCharacteristics', moddle.create('bpmn:StandardLoopCharacteristics'));
        }
      }

      const currentIsForCompensationValue = node.definition.get('isForCompensation');
      const newIsForCompensationValue = value.markerFlags.isForCompensation;

      if (newIsForCompensationValue != null && newIsForCompensationValue !== currentIsForCompensationValue) {
        setNodeProp(node, 'isForCompensation', newIsForCompensationValue);
      }
    }

    defaultInspectorHandler(omit(value, 'markerFlags'));
  },
  inspectorData(node, defaultDataTransform) {
    const inspectorData =  defaultDataTransform(node);

    inspectorData.markerFlags = {
      isForCompensation: inspectorData.isForCompensation,
      loopCharacteristics: inspectorData.loopCharacteristics ? 'loop' : 'no_loop',
    };
    delete inspectorData.isForCompensation;
    delete inspectorData.loopCharacteristics;

    return inspectorData;
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
            name: 'inspector-accordion',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        advancedAccordionConfigWithMarkerFlags,
      ],
    },
  ],
};
