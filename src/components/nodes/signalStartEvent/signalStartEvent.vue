<script>
import startEvent from '../startEvent/startEvent';
import signalStartEventIcon from '@/assets/signal-start-event.svg';

export default {
  extends: startEvent,
  props: ['moddle', 'rootElements', 'id'],
  data() {
    return {
      signal: this.moddle.create('bpmn:Signal', {
        id: `${this.id}_signal`,
        name: `${this.id}_signal`,
      }),
    };
  },
  methods: {
    addSignalRef() {
      if (this.node.definition.get('eventDefinitions')[0].signalRef) {
        this.signal = this.node.definition.get('eventDefinitions')[0].signalRef;
        return;
      }

      this.signal = this.moddle.create('bpmn:Signal', {
        id: `${this.id}_signal`,
        name: `${this.id}_signal`,
      });
      this.rootElements.push(this.signal);
      this.node.definition.get('eventDefinitions')[0].signalRef = this.signal;
    },
  },
  mounted() {
    this.shape.attr({
      image: {
        'ref-x': 5,
        'ref-y': 3,
        'xlink:href': signalStartEventIcon,
      },
    });
    this.addSignalRef();
  },
};
</script>
