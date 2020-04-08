<script>
import startEvent from '../startEvent/startEvent';
import conditionalIcon from '!!svg-inline-loader!@/assets/conditional-icon.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: startEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: conditionalIcon,
    };
  },
};
</script>
