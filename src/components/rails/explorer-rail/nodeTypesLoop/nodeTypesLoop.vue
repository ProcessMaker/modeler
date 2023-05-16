<script>
import pinIcon from '@/assets/pin-angle.svg';
import pinFillIcon from '@/assets/pin-angle-fill.svg';
import nodeTypesStore from '@/nodeTypesStore';

export default {
  name: 'NodeTypesLoop',
  data() {
    return {
      pinIcon,
      pinFillIcon,
      showPin: false,
    };
  },
  methods: {
    unPin(object, idx) {
      if (this.pinnedObjects.find(obj => obj.id === idx)) return nodeTypesStore.commit('setUnpinNode', object);
    },
    addPin(object) {
      return nodeTypesStore.commit('setPinnedNodes', object);
    },
  },
  computed: {
    pinnedObjects() {
      return nodeTypesStore.getters.getPinnedNodeTypes;
    },
    objects() {
      return nodeTypesStore.getters.getNodeTypes;
    },
    unpinnedObjects() {
      return this.objects.filter((obj) => !this.pinnedObjects.includes(obj));
    },
  },
};
</script>

<template>
  <div>
    <div class="pinnedObjects" v-if="pinnedObjects.length > 0">
      <p>{{ $t('Pinned Objects') }}</p>
      <template v-for="pinnedObject in pinnedObjects">
        <div
          class="node-types__item"
          :key="pinnedObject.id"
          @mouseover="showPin = true"
          @mouseleave="showPin = false"
        >
          <img class="node-types__item__icon" :src="pinnedObject.icon" :alt="$t(pinnedObject.label)">
          <span>{{ $t(pinnedObject.label) }}</span>
          <img
            :src="pinFillIcon"
            class="pinIcon"
            alt="Pin/Unpin Element"
            @click="unPin(pinnedObject, pinnedObject.id)"
          >
        </div>
      </template>
    </div>
    <div class="objectCategory">
      <p>{{ $t('Object Category') }}</p>
      <template v-for="nodeType in unpinnedObjects">
        <div
          class="node-types__item"
          :key="nodeType.id"
          @mouseover="showPin = true"
          @mouseleave="showPin = false"
        >
          <img class="node-types__item__icon" :src="nodeType.icon" :alt="$t(nodeType.label)">
          <span>{{ $t(nodeType.label) }}</span>
          <img
            :src="pinIcon"
            class="pinIcon"
            alt="Pin/Unpin Element"
            @click="addPin(nodeType)"
          >
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.node-types {
  &__item {
    display: flex;
    padding: 0.5rem 0.3rem;
    align-items: center;
    border-radius: 4px;
    &:hover {
      background-color: #EBEEF2;
      .pinIcon {
        background-color: #DADDDF;
      }
    }
    &__icon {
      width: 1.5rem;
      height: 1.5rem;
    }
    span {
      margin-left: 0.8rem;
      font-size: 13px;
      line-height: 19px;
    }
    .pinIcon {
      margin-left: auto;
      border-radius: 4px;
      padding: 0.3rem;
    }
  }
}
</style>
