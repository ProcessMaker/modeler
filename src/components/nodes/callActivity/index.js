import component from './callActivity';

export const taskHeight = 76;

export default {
  id: 'processmaker-modeler-call-activity',
  component,
  bpmnType: ['bpmn:Task', 'bpmn:CallActivity'],
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/callActivity.svg'),
  label: 'Call Activity',
  definition(moddle) {
    return moddle.create('bpmn:CallActivity', {
      name: 'New Call Activity',
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
  inspectorConfig: [
    {
      name: 'Call Activity',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Call Activity',
            fontSize: '2em',
          },
        },
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'confifuration',
          },
          items: [
            {
              component: 'FormInput',
              config: {
                label: 'Identifier',
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'id',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The Name of the Call Activity',
                name: 'name',
              },
            },
          ],
        },
      ],
    },
  ],
};
