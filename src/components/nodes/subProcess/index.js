import component from './subProcess';
import ProcessFormSelect from '@/components/inspectors/ProcessFormSelect';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';
import { taskHeight, taskWidth } from '@/components/nodes/task/taskConfig';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import defaultNames from '@/components/nodes/task/defaultNames';
import { loopCharacteristicsHandler } from '@/components/inspectors/LoopCharacteristics';

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
  inspectorHandler(value, node, setNodeProp) {
    if (node.definition.get('id') !== value['id']) {
      window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
        id: node.definition.id, key: 'id', value: value.id,
      });
      setNodeProp(node, 'id', value.id);
    }
    if (node.definition.get('name') !== value['name']) {
      window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
        id: node.definition.id, key: 'name', value: value.name,
      });
      setNodeProp(node, 'name', value.name);
    }
    const currentConfig = JSON.parse(value.config);

    value['calledElement'] = currentConfig.calledElement;
    window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
      id: node.definition.id, key: 'calledElement', value: currentConfig.calledElement,
    });
    setNodeProp(node, 'calledElement', currentConfig.calledElement);

    if (currentConfig.name !== value.name) {
      currentConfig.name = value.name;
    }
    window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
      id: node.definition.id, key: 'config', value: JSON.stringify(currentConfig),
    });
    setNodeProp(node, 'config', JSON.stringify(currentConfig));

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
            name: 'inspector-accordion-subprocess',
          },
          items: [
            {
              component: 'FormInput',
              config: nameConfigSettings,
            },
            {
              component: ProcessFormSelect,
              config: {
                name: 'config',
              },
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
