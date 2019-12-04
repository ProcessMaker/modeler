<script>
import StartEvent from '@/components/nodes/startEvent/startEvent';
import clockIcon from '@/assets/clock.svg';

export default {
  extends: StartEvent,
  data() {
    return {
      dropdownData: [],
    };
  },
  mounted() {
    this.shape.attr('image/xlink:href', clockIcon);
  },
};
</script>
