<template>
  <img
    :src="trashIcon"
    @click="$emit('click')"
    id="delete-button"
    data-test="delete-button"
    aria-hidden="true"
    data-prefix="fas"
    data-icon="trash-alt"
    class="svg-inline--fa fa-trash-alt fa-w-14"
    role="img"
    alt="Delete this node"
  >
</template>

<script>
import trashIcon from '@/assets/trash-alt-solid.svg';

export default {
  data() {
    return {
      trashIcon,
    };
  },
};
</script>
