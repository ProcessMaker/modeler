<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import errorBoltIcon from '!!svg-inline-loader!@/assets/boundary-error-event-icon.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: BoundaryEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: errorBoltIcon,
    };
  },
};
</script>
