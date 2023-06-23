<template>
  <crown-button
    id="lane-below-button"
    aria-label="Add lane below icon"
    v-on="$listeners"
    :width="25"
  >
    <font-awesome-icon :icon="['fpm', 'fa-lane-below']"/>
  </crown-button>
</template>

<script>
import laneBelowIcon from '@/assets/lane-below.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLaneBelow } from './icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';


export default {
  components: { CrownButton, FontAwesomeIcon },
  data() {
    return {
      laneBelowIcon,
    };
  },
  created() {
    library.add(faLaneBelow);
  },
};
</script>