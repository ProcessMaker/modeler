import component from './callActivity';
import CallActivityFormSelect from './CallActivityFormSelect';
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
  icon: require('@/assets/toolpanel/callActivity.svg'),
  label: 'Call Activity',
  definition(moddle, $t) {
    return moddle.create('bpmn:CallActivity', {
      name: $t('New Call Activity'),
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
      name: 'Call Activity',
      items: [
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'configuration',
          },
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
            {
              component: 'FormInput',
              config: {
                ...nameConfigSettings,
                helper: 'The Name of the Call Activity',
              },
            },
            {
              component: CallActivityFormSelect,
              config: {
                label: 'Process',
                name: 'calledElement',
              },
            },
          ],
        },
      ],
    },
  ],
};
