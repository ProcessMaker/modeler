import component from './task.vue';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { taskHeight, taskWidth } from './taskConfig';
import defaultNames from '@/components/nodes/task/defaultNames';
import advancedAccordionConfigWithMarkerFlags from '@/components/inspectors/advancedAccordionConfigWithMarkerFlags';
import loopCharacteristicsInspector from '@/components/inspectors/LoopCharacteristics';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import omit from 'lodash/omit';
import NodeInspector from '../../../NodeInspector';

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
  inspectorHandler(value, node, setNodeProp, moddle, definitions, defaultInspectorHandler) {
    const nodeInspector = new NodeInspector(definitions);
    handleMarkerFlagsValue(value.markerFlags, node, setNodeProp, moddle);
    nodeInspector.setDefinitionProps(value.$config, setNodeProp, moddle, node.definition);
    defaultInspectorHandler(omit(value, 'markerFlags', '$config'));
  },
  inspectorData(node, defaultDataTransform, { definitions }) {
    const nodeInspector = new NodeInspector(definitions);
    const inspectorData = defaultDataTransform(node);
    inspectorData.$config = nodeInspector.getDefinitionProps(node.definition);

    inspectorData.markerFlags = {
      isForCompensation: inspectorData.isForCompensation,
      loopCharacteristics: getLoopCharacteristicsRadioValue(inspectorData.loopCharacteristics),
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
            name: 'inspector-accordion-task',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
          ],
        },
        advancedAccordionConfigWithMarkerFlags,
        documentationAccordionConfig,
        loopCharacteristicsInspector,
      ],
    },
  ],
};

function handleMarkerFlagsValue(markerFlags, node, setNodeProp, moddle) {
  if (!markerFlags) {
    return;
  }

  if (markerFlags.loopCharacteristics) {
    if (markerFlags.loopCharacteristics === 'no_loop') {
      setNodeProp(node, 'loopCharacteristics', null);
    }

    const currentLoopCharacteristics = node.definition.get('loopCharacteristics') || {};

    if (markerFlags.loopCharacteristics === 'loop' && currentLoopCharacteristics.$type !== 'bpmn:StandardLoopCharacteristics') {
      setNodeProp(node, 'loopCharacteristics', moddle.create('bpmn:StandardLoopCharacteristics'));
    }

    if (markerFlags.loopCharacteristics === 'parallel_mi' ) {
      if (currentLoopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics' && !currentLoopCharacteristics.isSequential){
        return;
      }
      setNodeProp(node, 'loopCharacteristics', moddle.create('bpmn:MultiInstanceLoopCharacteristics'));
    }

    if (markerFlags.loopCharacteristics === 'sequential_mi') {
      if (currentLoopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics' && currentLoopCharacteristics.isSequential){
        return;
      }
      setNodeProp(node, 'loopCharacteristics', moddle.create('bpmn:MultiInstanceLoopCharacteristics', { isSequential: true }));
    }
  }

  const currentIsForCompensationValue = node.definition.get('isForCompensation');
  const newIsForCompensationValue = markerFlags.isForCompensation;

  if (newIsForCompensationValue != null && newIsForCompensationValue !== currentIsForCompensationValue) {
    setNodeProp(node, 'isForCompensation', newIsForCompensationValue);
  }
}

function getLoopCharacteristicsRadioValue(loopCharacteristics) {
  if (!loopCharacteristics) {
    return 'no_loop';
  }

  if (loopCharacteristics.$type === 'bpmn:StandardLoopCharacteristics') {
    return 'loop';
  }

  if (loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics' && !loopCharacteristics.isSequential) {
    return 'parallel_mi';
  }

  if (loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics' && loopCharacteristics.isSequential) {
    return 'sequential_mi';
  }

  return 'no_loop';
}
