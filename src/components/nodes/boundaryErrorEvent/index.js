import component from './boundaryErrorEvent.vue';
import boundaryEventConfig from '../boundaryEvent';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import advancedAccordionConfig from '@/components/inspectors/advancedAccordionConfig';
import documentationAccordionConfig from '@/components/inspectors/documentationAccordionConfig';

export const id = 'processmaker-modeler-boundary-error-event';

export default merge(cloneDeep(boundaryEventConfig), {
  id,
  component,
  control: false,
  label: 'Boundary Error Event',
  icon: require('@/assets/toolpanel/boundary-error-event.svg'),
  definition(moddle, $t) {
    return moddle.create('bpmn:BoundaryEvent', {
      name: $t('Boundary Error Event'),
      eventDefinitions: [
        moddle.create('bpmn:ErrorEventDefinition'),
      ],
    });
  },
  inspectorConfig: [
    {
      items: [
        {
          items: [
            {},
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
});
