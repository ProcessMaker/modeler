<template>
  <crown-button
    id="lane-above-button"
    aria-label="Add lane above icon"
    v-on="$listeners"
    :width="25"
  >
    <font-awesome-icon :icon="['fpm', 'fa-lane-above']"/>
  </crown-button>
</template>

<script>
import laneAboveIcon from '@/assets/lane-above.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLaneAbove } from './icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';


export default {
  components: { CrownButton, FontAwesomeIcon },
  data() {
    return {
      laneAboveIcon,
    };
  },
  created() {
    library.add(faLaneAbove);
  },
};
</script>
