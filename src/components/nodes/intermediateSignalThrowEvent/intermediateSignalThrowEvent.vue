<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateSignalSymbol from '!!svg-inline-loader!@/assets/intermediate-signal-alt.svg';
import pull from 'lodash/pull';
import store from '@/store';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: IntermediateEvent,
  mixins: [updateIconColor],
  props: ['moddle', 'rootElements', 'id'],
  data() {
    return {
      signal: this.moddle.create('bpmn:Signal', {
        id: `${this.id}_signal`,
        name: `${this.id}_signal`,
      }),
      nodeIcon: intermediateSignalSymbol,
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
