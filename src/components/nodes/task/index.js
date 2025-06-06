import component from './task.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { taskHeight, taskWidth } from './taskConfig';
import defaultNames from '@/components/nodes/task/defaultNames';
import advancedAccordionConfigWithMarkerFlags from '@/components/inspectors/advancedAccordionConfigWithMarkerFlags';

import elementDestination from '@/components/inspectors/taskElementDestination';
import loopCharacteristicsInspector from '@/components/inspectors/LoopCharacteristics';
import { loopCharacteristicsHandler, loopCharacteristicsData } from '@/components/inspectors/LoopCharacteristics';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import omit from 'lodash/omit';

export const id = 'processmaker-modeler-task';

export default {
  id: 'processmaker-modeler-task',
  component,
  bpmnType: ['bpmn:Task', 'bpmn:UserTask', 'bpmn:GlobalTask', 'bpmn:SubProcess'],
  control: true,
  category: 'BPMN',
  rank: 40,
  icon: require('@/assets/toolpanel/task.svg'),
  label: 'Task',
  items: [
    {
      icon: require('@/assets/toolpanel/task.svg'),
      label: 'Form Task',
      control: true,
      rank: 41,
      id: 'processmaker-modeler-task',
    },
    {
      icon: require('@/assets/toolpanel/manual-task.svg'),
      label: 'Manual Task',
      control: true,
      rank: 42,
      id: 'processmaker-modeler-manual-task',
    },
    {
      icon: require('@/assets/toolpanel/script-task.svg'),
      label: 'Script Task',
      control: true,
      rank: 43,
      id: 'processmaker-modeler-script-task',
    },
    {
      icon: require('@/assets/toolpanel/sub-task.svg'),
      label: 'Sub Process',
      control: true,
      rank: 44,
      id: 'processmaker-modeler-call-activity',
    },
  ],
  definition(moddle, $t) {
    return moddle.create('bpmn:Task', {
      name: $t(defaultNames[id]),
      assignment: 'requester',
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
  inspectorHandler(value, node, setNodeProp, moddle, definitions, defaultInspectorHandler, isMultiplayer) {
    handleMarkerFlagsValue(value.markerFlags, node, setNodeProp);
    loopCharacteristicsHandler(value, node, setNodeProp, moddle, definitions, isMultiplayer);
    defaultInspectorHandler(omit(value, 'markerFlags', '$loopCharactetistics'), isMultiplayer);
    handleElementDestination(value.elementDestination, node, setNodeProp);
  },
  inspectorData(node, defaultDataTransform, inspector) {
    const inspectorData = defaultDataTransform(node);
    loopCharacteristicsData(inspectorData, node, defaultDataTransform, inspector);
    inspectorData.markerFlags = {
      isForCompensation: inspectorData.isForCompensation,
    };
    delete inspectorData.isForCompensation;

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
            label: 'Properties',
            icon: 'cog',
            name: 'inspector-accordion-task',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
            elementDestination,
          ],
        },
        loopCharacteristicsInspector,
        documentationAccordionConfig,
        advancedAccordionConfigWithMarkerFlags,
      ],
    },
  ],
  // reference for packages
  loopCharacteristicsHandler,
  loopCharacteristicsData,
};

function handleMarkerFlagsValue(markerFlags, node, setNodeProp) {
  if (!markerFlags) {
    return;
  }

  const currentIsForCompensationValue = node.definition.get('isForCompensation');
  const newIsForCompensationValue = markerFlags.isForCompensation;

  if (newIsForCompensationValue != null && newIsForCompensationValue !== currentIsForCompensationValue) {
    setNodeProp(node, 'isForCompensation', newIsForCompensationValue);
  }
}

function handleElementDestination(value, node, setNodeProp) {
  if (value) {
    setNodeProp(node, 'elementDestination', value);
  }
}
