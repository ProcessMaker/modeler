import component from './boundaryConditionalEvent';
import boundaryEventConfig from '../boundaryEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import interruptingToggleConfig from '../boundaryEvent/interruptingToggleInspector';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';

export default merge(cloneDeep(boundaryEventConfig), {
  id: 'processmaker-modeler-boundary-conditional-event',
  component,
  control: false,
  label: 'Boundary Conditional Event',
  icon: require('@/assets/conditional-icon.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('Boundary Conditional Event'),
      eventDefinitions: [
        moddle.create('bpmn:ConditionalEventDefinition'),
      ],
    });
  },
  inspectorConfig: [{
    items: [
      {
        items: [
          {},
          interruptingToggleConfig,
        ],
      },
      advancedAccordionConfig,
    ],
  }],
});
