<script>
import startEvent from '../startEvent/startEvent';
import startMailSymbol from '@/assets/start-event-mail.svg';

export default {
  extends: startEvent,
  data() {
    return {
      dropdownData: [],
    };
  },
  mounted() {
    this.shape.attr('image/xlink:href', startMailSymbol);
  },
};
</script>
