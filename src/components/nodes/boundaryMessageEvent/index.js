import component from './boundaryMessageEvent.vue';
import boundaryEventConfig from '../boundaryEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import interruptingToggleConfig from '../boundaryEvent/interruptingToggleInspector';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import { default as messageEventDefinition, messageSelector } from '../messageEventDefinition';

export const id = 'processmaker-modeler-boundary-message-event';
export default merge(cloneDeep(boundaryEventConfig), {
  ...messageEventDefinition,
  id,
  component,
  control: false,
  label: 'Boundary Message Event',
  icon: require('@/assets/toolpanel/boundary-message-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('Boundary Message Event'),
      cancelActivity: true,
      eventDefinitions: [
        moddle.create('bpmn:MessageEventDefinition'),
      ],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [
            {},
            interruptingToggleConfig,
            messageSelector('Message that will trigger this boundary event'),
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
});
