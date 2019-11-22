<template>
  <crown-button
    id="delete-button"
    aria-label="Delete this node"
    :src="trashIcon"
    v-on="$listeners"
  />
</template>

<script>
import trashIcon from '@/assets/trash-alt-solid.svg';
import CrownButton from '@/components/crownButton';

export default {
  components: { CrownButton },
  data() {
    return {
      trashIcon,
    };
  },
};
</script>
