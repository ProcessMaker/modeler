<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import intermediateMailSymbol from '@/assets/intermediate-mail-alt.svg';
import pull from 'lodash/pull';

export default {
  extends: IntermediateEvent,
  props: ['moddle', 'rootElements', 'id'],
  data() {
    return {
      message: this.moddle.create('bpmn:Message', {
        id: `${this.id}_message`,
        name: `${this.id}_message`,
      }),
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
    this.shape.attr('image/xlink:href', intermediateMailSymbol);
    this.shape.attr({
      image: {
        width: 22,
        height: 20,
        y: 3,
        x: 2,
      },
    });

    this.addMessageRef();
  },
  destroyed() {
    pull(this.rootElements, this.message);
  },
};
</script>
