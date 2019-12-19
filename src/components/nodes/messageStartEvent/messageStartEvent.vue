<script>
import startEvent from '../startEvent/startEvent';
import startMailSymbol from '@/assets/start-event-mail.svg';

export default {
  extends: startEvent,
  mounted() {
    this.shape.attr('image/xlink:href', startMailSymbol);
  },
};
</script>
