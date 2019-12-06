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
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/subProcess.svg'),
  label: 'Sub Process',
  definition(moddle, $t) {
    return moddle.create('bpmn:CallActivity', {
      name: $t('New Sub Process'),
      calledElement: '',
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
    for (const key in value) {
      if (node.definition[key] === value[key]) {
        continue;
      }

      if (key === 'callActivityExpression') {
        this.inspectorHandler(value[key], node, setNodeProp);
        continue;
      }

      setNodeProp(node, key, value[key]);
    }
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
              config: {
                ...nameConfigSettings,
                helper: 'The Name of the Sub Process',
              },
            },
            {
              component: SubProcessFormSelect,
              config: {
                label: 'Process',
                name: 'calledElement',
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
