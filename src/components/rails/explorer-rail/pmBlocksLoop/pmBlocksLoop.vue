<script>
import pinIcon from '@/assets/pin-angle.svg';
import pinFillIcon from '@/assets/pin-angle-fill.svg';
import nodeTypesStore from '@/nodeTypesStore';
import clickAndDrop from '@/mixins/clickAndDrop';
import iconHelper from '@/mixins/iconHelper';

export default {
  name: 'PmBlocksLoop',
  mixins: [clickAndDrop, iconHelper],
  data() {
    return {
      pinIcon,
      pinFillIcon,
      showPin: false,
    };
  },
  created() {
    nodeTypesStore.dispatch('getUserPinnedObjects');
  },
  methods: {
    nodeTypeAlreadyPinned(object, type) {
      return !!this.pinnedObjects.find(obj => obj.type === type);
    },
    unPin(object) {
      this.deselect();
      return nodeTypesStore.dispatch('removeUserPinnedObject', object);
    },
    addPin(object) {
      this.deselect();
      return nodeTypesStore.dispatch('addUserPinnedObject', object);
    },
  },
  computed: {
    pinnedObjects() {
      const pinnedNodeTypes = nodeTypesStore.getters.getPinnedNodeTypes;

      //Filter pinnedNodeTypes to only return objects with PM Blocks type.
      const filteredPinnedNodeTypes = pinnedNodeTypes.filter(obj => {
        return obj.type?.includes('processmaker-pm-block');
      });

      return filteredPinnedNodeTypes; 
    },
    unpinnedObjects() {
      const objects = this.pmBlockNodeTypes;
      return objects.filter((obj) => !this.pinnedObjects.some(pinnedObj => pinnedObj.type === obj.type));
    },
    pmBlockNodeTypes() {
      return nodeTypesStore.getters.getPmBlockNodeTypes;
    },
    filteredPmBlockNodes() {
      return nodeTypesStore.getters.getFilteredPmBlockNodeTypes;
    },
    searchTerm() {
      return nodeTypesStore.getters.getSearchTerm;
    },
  },
};
</script>

<template>
  <div id="pmBlockNodeTypesList">
    <div id="filteredPmBlockNodes-container" v-if="filteredPmBlockNodes.length > 0">
      <template v-for="object in filteredPmBlockNodes">
        <div
          class="node-types__item"
          :data-test="object.type"
          :key="object.id"
          @mouseover="showPin = true"
          @mouseleave="showPin = false"
          @click.stop="onClickHandler($event, object)"
        >
          <div class="d-flex">
            <i v-if="!object.svgIcon" class="node-types__item__icon" :class="object.customIcon"/>
            <img v-else class="node-types__item__icon" :src="object.svgIcon" :alt="$t(object.label)">
            <label>{{ $t(object.label) }}</label>
            <img
              v-if="nodeTypeAlreadyPinned(object, object.type)"
              :src="pinFillIcon"
              class="pinIcon"
              alt="Unpin Element"
              @click="unPin(object)"
            >
            <img
              v-else
              :src="pinIcon"
              class="pinIcon"
              alt="Pin Element"
              @click="addPin(object)"
            >
          </div>
        </div>
      </template>
    </div>
    <template v-if="filteredPmBlockNodes.length === 0 && !searchTerm">
      <div class="pinnedObjects" v-if="pinnedObjects.length > 0">
        <p>{{ $t('Pinned PM Blocks') }}</p>
        <template v-for="pinnedObject in pinnedObjects">
          <div
            class="node-types__item"
            :data-test="pinnedObject.type"
            :key="pinnedObject.id"
            @mouseover="showPin = true"
            @mouseleave="showPin = false"
            @click.stop="onClickHandler($event, pinnedObject)"
          >
            <i v-if="!containsSvg(pinnedObject.icon)" :class="pinnedObject.customIcon" class="fa-lg"/>
            <img v-else class="node-types__item__icon" :src="pinnedObject.svgIcon" :alt="$t(pinnedObject.label)">
            <span>{{ $t(pinnedObject.label) }}</span>
            <img
              :src="pinFillIcon"
              class="pinIcon"
              alt="Pin/Unpin Element"
              @click="unPin(pinnedObject)"
            >
          </div>
        </template>
      </div>
      <div class="objectCategory">
        <p>{{ $t('PM Block Category') }}</p>
        <template v-for="nodeType in unpinnedObjects">
          <div
            class="node-types__item"
            :data-test="nodeType.type"
            :key="nodeType.id"
            @mouseover="showPin = true"
            @mouseleave="showPin = false"
            @click.stop="onClickHandler($event, nodeType)"
          >
            <i v-if="!containsSvg(nodeType.icon)" :class="nodeType.customIcon" class="fa-lg"/>
            <img v-else class="node-types__item__icon" :src="nodeType.svgIcon" :alt="$t(nodeType.label)">
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
    </template>
  </div>
</template>

<style lang="scss">
#pmBlockNodeTypesList {
  .pinnedObjects {
    margin-bottom: 1rem;
  }
}
.pm-block-node-types {
  &__item {
    display: block;
    padding: 0.5rem 0.3rem;
    border-radius: 4px;
    user-select: none;
    margin-bottom: 8px;
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
    label {
      max-width: 225px;
      font-size: 14px;
      line-height: 15px;
    }
    span {
      margin-left: 1.6rem;
      font-size: 13px;
      color:#6C757D;
    }
    .pinIcon {
      margin-left: auto;
      border-radius: 4px;
      padding: 0.3rem;
    }
  }
}
</style>
