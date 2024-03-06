<script>
import EndEvent from '@/components/nodes/endEvent/endEvent';
import terminateIcon from '@/assets/terminate-end-event.svg?raw';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: EndEvent,
  mixins: [updateIconColor],
  props: ['moddle', 'rootElements', 'id'],
  data() {
    return {
      nodeIcon: terminateIcon,
    };
  },
};
</script>
