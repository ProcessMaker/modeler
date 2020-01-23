import component from './subProcess';
import SubProcessFormSelect from './SubProcessFormSelect';
import idConfigSettings from '@/components/inspectors/idConfigSettings';
import nameConfigSettings from '@/components/inspectors/nameConfigSettings';

export const taskHeight = 76;
export const id = 'processmaker-modeler-call-activity';

export default {
  id,
  component,
  bpmnType: 'bpmn:CallActivity',
  control: false,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/subProcess.svg'),
  label: 'Sub Process',
  definition(moddle, $t) {
    return moddle.create('bpmn:CallActivity', {
      name: $t('New Sub Process'),
      calledElement: '',
      config: '{}'
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
  inspectorHandler(value, node, setNodeProp) {

    setNodeProp(node, 'id', value.id);
    setNodeProp(node, 'name', value.name);

    const oldConfig     = JSON.parse(node.definition.config);
    const currentConfig = JSON.parse(value.config);
    
    setNodeProp(node, 'calledElement', currentConfig.calledElement);

    if (currentConfig.name != value.name) {
      if (oldConfig.name === value.name || !oldConfig.name) {
        // SubProcessFormSelect automatically updated the name so set the new name here
        setNodeProp(node, 'name', currentConfig.name);
      } else {
        // The user is editing the name field manually, so update the config object name
        currentConfig.name = value.name;
      }
    }
    
    setNodeProp(node, 'config', JSON.stringify(currentConfig));

  },
  inspectorConfig: [
    {
      name: 'Sub Process',
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
            {
              component: SubProcessFormSelect,
              config: {
                label: 'Process',
                name: 'config',
                helper: 'Select which Process this element calls',
              },
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
            name: 'inspector-accordion',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
          ],
        },
      ],
    },
  ],
};
