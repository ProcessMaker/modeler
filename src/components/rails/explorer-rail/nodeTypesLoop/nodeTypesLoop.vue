<script>
import pinIcon from '@/assets/pin-angle.svg';
import pinFillIcon from '@/assets/pin-angle-fill.svg';
import nodeTypesStore from '@/nodeTypesStore';

export default {
  name: 'NodeTypesLoop',
  props: {
    label: {
      type: String,
    },
    nodeTypes: {
      type: Array,
    },
    pinned: {
      type: Boolean,
    },
  },
  data() {
    return {
      pinIcon,
      pinFillIcon,
      showPin: false,
    };
  },
  methods: {
    pinObject(object) {
      nodeTypesStore.commit('setPinnedNodes', object);
    },
    unpinObject(object) {
      nodeTypesStore.commit('setUnpinNode', object);
    },
  },
};
</script>

<template>
  <div>
    <p>{{ $t(label) }}</p>
    <template v-for="nodeType in nodeTypes">
      <div
        class="node-types__item"
        :key="nodeType.id"
        @mouseover="showPin = true"
        @mouseleave="showPin = false"
      >
        <img :src="nodeType.icon" :alt="$t(nodeType.label)">
        <span>{{ $t(nodeType.label) }}</span>

        <button
          v-if="pinned"
          class="pinIcon"
          @click="unpinObject(nodeType)"
        >
          <img
            :src="pinFillIcon"
            alt="Unpin Element"
          >
        </button>

        <button
          v-else-if="showPin"
          class="pinIcon"
          @click="pinObject(nodeType)"
        >
          <img
            :src="pinIcon"
            alt="Pin Element"
          >
        </button>

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
