<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateSignalSymbol from '@/assets/intermediate-signal-alt.svg';
import pull from 'lodash/pull';
import store from '@/store';

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
        'ref-x': 7,
        'ref-y': 5,
        'xlink:href': intermediateSignalSymbol,
        width: 22,
        height: 22,
      },
    });

    this.addSignalRef();
  },
  destroyed() {
    pull(this.rootElements, this.signal);
    store.commit('removeSignalRef', this.signal);
  },
};
</script>
