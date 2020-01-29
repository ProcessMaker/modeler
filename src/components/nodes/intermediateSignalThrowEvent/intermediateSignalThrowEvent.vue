<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateSignalSymbol from '@/assets/intermediate-signal-alt.svg';
import pull from 'lodash/pull';

export default {
  extends: IntermediateEvent,
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
    addMessageRef() {
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
    this.shape.attr('image/xlink:href', intermediateSignalSymbol);
    this.shape.attr({
      image: {
        width: 22,
        height: 20,
        y: 1,
        x: 2,
      },
    });

    this.addMessageRef();
  },
  destroyed() {
    pull(this.rootElements, this.signal);
  },
};
</script>
