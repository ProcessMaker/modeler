import component from './subProcess';
import SubProcessFormSelect from './SubProcessFormSelect';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { taskHeight, taskWidth } from '@/components/nodes/task/taskConfig';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import loopCharacteristicsInspector from '@/components/inspectors/LoopCharacteristics';
import { loopCharacteristicsHandler, loopCharacteristicsData } from '@/components/inspectors/LoopCharacteristics';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/task/defaultNames';

export const id = 'processmaker-modeler-call-activity';

export default {
  id,
  component,
  bpmnType: 'bpmn:CallActivity',
  control: false,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/subProcess.svg'),
  label: defaultNames[id],
  definition(moddle, $t) {
    return moddle.create('bpmn:CallActivity', {
      name: $t(defaultNames[id]),
      calledElement: '',
      config: '{}',
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
  inspectorHandler(value, node, setNodeProp, moddle, definitions) {

    value = loopCharacteristicsHandler(value, node, setNodeProp, moddle, definitions);
  
    setNodeProp(node, 'id', value.id);
    setNodeProp(node, 'name', value.name);

    const currentConfig = JSON.parse(value.config);

    setNodeProp(node, 'calledElement', currentConfig.calledElement);

    if (currentConfig.name !== value.name) {
      currentConfig.name = value.name;
    }

    setNodeProp(node, 'config', JSON.stringify(currentConfig));

  },
  inspectorData(node, defaultDataTransform, inspector) {
    const inspectorData = defaultDataTransform(node);
    loopCharacteristicsData(inspectorData, node, defaultDataTransform, inspector);
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
            name: 'inspector-accordion-subprocess',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
            {
              component: SubProcessFormSelect,
              config: {
                name: 'config',
              },
            },
          ],
        },
        loopCharacteristicsInspector,
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
};
