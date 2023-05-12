<script>
export default {
  name: 'NodeTypesLoop',
  props: {
    label: {
      type: String,
    },
    nodeTypes: {
      type: Array,
    },
  },
};
</script>

<template>
  <div>
    <p>{{ $t(label) }}</p>
    <template v-for="nodeType in nodeTypes">
      <div class="node-types__item" :key="nodeType.id">
        <img :src="nodeType.icon" :alt="$t(nodeType.label)">
        <span>{{ $t(nodeType.label) }}</span>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.node-types {
  &__item {
    display: flex;
    margin-bottom: 1rem;
    align-items: center;
    img {
      height: 1.5rem;
      width: 1.5rem;
    }
    span {
      margin-left: 0.8rem;
      font-size: 13px;
      line-height: 19px;
    }
  }
}
</style>
