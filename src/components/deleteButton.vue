<template>
  <crown-button
    id="delete-button"
    aria-label="Delete this node"
    @click="$emit('click')"
  >
    <img
      :src="trashIcon"
      aria-hidden="true"
      data-prefix="fas"
      data-icon="trash-alt"
      class="svg-inline--fa fa-trash-alt fa-w-14"
      alt=""
    >
  </crown-button>
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
