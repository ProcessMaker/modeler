<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import timerEventIcon from '@/assets/timer-event-icon.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: BoundaryEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: timerEventIcon,
    };
  },
  methods: {
    addTimerEventDefinitionId() {
      const id = `${this.id}_timer_event_definition`;
      this.node.definition.get('eventDefinitions')[0].id = id;
    },
  },
  mounted() {
    this.addTimerEventDefinitionId();
  },
};
</script>
