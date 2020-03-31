<script>
import startEvent from '../startEvent/startEvent';
import startMailSymbol from '!!svg-inline-loader!@/assets/start-event-mail.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: startEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: startMailSymbol,
    };
  },
};
</script>
