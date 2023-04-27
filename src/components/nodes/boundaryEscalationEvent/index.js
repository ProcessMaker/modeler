import component from './boundaryEscalationEvent.vue';
import boundaryEventConfig from '../boundaryEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import interruptingToggleConfig from '../boundaryEvent/interruptingToggleInspector';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';
import icon from '@/assets/toolpanel/boundary-escalation-event.svg?url';

export const id = 'processmaker-modeler-boundary-escalation-event';

export default merge(cloneDeep(boundaryEventConfig), {
  id,
  component,
  control: false,
  label: 'Boundary Escalation Event',
  icon,
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('Boundary Escalation Event'),
      cancelActivity: true,
      eventDefinitions: [
        moddle.create('bpmn:EscalationEventDefinition'),
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
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
});
