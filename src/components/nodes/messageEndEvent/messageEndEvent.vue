<script>
import EndEvent from '@/components/nodes/endEvent/endEvent';
import messageEndEventSymbol from '!!svg-inline-loader!@/assets/message-end-event.svg';
import pull from 'lodash/pull';
import store from '@/store';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: EndEvent,
  mixins: [updateIconColor],
  props: ['node', 'rootElements', 'id'],
  data() {
    return {
      message: this.moddle.create('bpmn:Message', {
        id: `${this.id}_message`,
        name: `${this.id}_message`,
      }),
      nodeIcon: messageEndEventSymbol,
    };
  },
  methods: {
    addMessageRef() {
      if (this.node.definition.get('eventDefinitions')[0].messageRef) {
        this.message = this.node.definition.get('eventDefinitions')[0].messageRef;
        return;
      }

      this.message = this.moddle.create('bpmn:Message', {
        id: `${this.id}_message`,
        name: `${this.id}_message`,
      });
      this.rootElements.push(this.message);
      this.node.definition.get('eventDefinitions')[0].messageRef = this.message;
    },
  },
  mounted() {
    this.addMessageRef();
  },
  destroyed() {
    pull(this.rootElements, this.message);
    store.commit('removeMessageRef', this.message);
  },
};
</script>
