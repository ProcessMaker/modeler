<script>
import EndEvent from '@/components/nodes/endEvent/endEvent';
import errorIcon from '@/assets/error.svg';
import pull from 'lodash/pull';

export default {
  extends: EndEvent,
  props: ['moddle', 'rootElements', 'id'],
  data() {
    return {
      error: this.moddle.create('bpmn:Error', {
        id: `${ this.id }_error`,
        name: `${ this.id }_error`,
      }),
    };
  },
  mounted() {
    this.shape.attr('image/xlink:href', errorIcon);
    this.rootElements.push(this.error);
    this.node.definition.get('eventDefinitions')[0].errorRef = this.error;
  },
  destroyed() {
    pull(this.rootElements, this.error);
  },
};
</script>
