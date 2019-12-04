<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import clockIcon from '@/assets/intermediate-clock.svg';

export default {
  extends: IntermediateEvent,
  mounted() {
    this.shape.attr('image/xlink:href', clockIcon);
  },
  data() {
    return {
      dropdownData: [
        {
          label: 'Intermediate Timer Event',
          nodeType: 'processmaker-modeler-intermediate-catch-timer-event',
          dataTest: '',
        },
        {
          label: 'Intermediate Message Catch Event',
          nodeType: 'processmaker-modeler-intermediate-message-catch-event',
          dataTest: '',
        },
        {
          label: 'Intermediate Message Throw Event',
          nodeType: 'processmaker-modeler-intermediate-message-throw-event',
          dataTest: '',
        },
      ],
    };
  },
};
</script>
