<script>
import pinIcon from '@/assets/pin-angle.svg';
import pinFillIcon from '@/assets/pin-angle-fill.svg';
import nodeTypesStore from '@/nodeTypesStore';
import clickAndDrop from '@/mixins/clickAndDrop';
import iconHelper from '@/mixins/iconHelper';

export default {
  name: 'NodeTypesLoop',
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

      // Filter pinnedNodeTypes to exclude objects with PM Blocks type.
      const filteredPinnedNodeTypes = pinnedNodeTypes.filter(obj => {
        return !obj.type?.includes('processmaker-pm-block');
      });

      return filteredPinnedNodeTypes; 
    },
    objects() {
      return nodeTypesStore.getters.getNodeTypes;
    },
    unpinnedObjects() {
      const objects = this.objects;
      return objects.filter((obj) => !this.pinnedObjects.some(pinnedObj => pinnedObj.type === obj.type));
    },
    filteredNodes() {
      return nodeTypesStore.getters.getFilteredNodeTypes;
    },
    searchTerm() {
      return nodeTypesStore.getters.getSearchTerm;
    },
  },
};
</script>

<template>
  <div id="nodeTypesList">
    <div id="filteredNodes-container" v-if="filteredNodes.length > 0">
      <template v-for="object in filteredNodes">
        <div
          class="node-types__item"
          :class="{'node-types__item__highlight': object.type === 'processmaker-ai-assistant'}"
          :data-test="object.type"
          :key="object.id"
          @mouseover="showPin = true"
          @mouseleave="showPin = false"
          @mousedown.stop="startDragNewObject($event, object)"
          @mouseup.stop="cancelDragNewObject()"
        >
          <i v-if="!containsSvg(object.icon)" :class="object.icon" class="fa-lg"/>
          <img v-else class="node-types__item__icon" :src="object.icon" :alt="$t(object.label)">
          <span>{{ $t(object.label) }}</span>
          <img
            v-if="nodeTypeAlreadyPinned(object, object.type)"
            :src="pinFillIcon"
            class="pinIcon"
            alt="Unpin Element"
            @click="unPin(object)"
            @mousedown.stop="cancelDragNewObject()"
          >
          <img
            v-else
            :src="pinIcon"
            class="pinIcon"
            alt="Pin Element"
            @click="addPin(object)"
            @mousedown.stop="cancelDragNewObject()"
          >
        </div>
      </template>
    </div>
    <template v-if="filteredNodes.length === 0 && !searchTerm">
      <div class="pinnedObjects" v-if="pinnedObjects.length > 0">
        <p>{{ $t('Pinned Objects') }}</p>
        <template v-for="pinnedObject in pinnedObjects">
          <div
            class="node-types__item"
            :class="{'node-types__item__highlight': pinnedObject.type === 'processmaker-ai-assistant'}"
            :data-test="pinnedObject.type"
            :key="pinnedObject.id"
            @mouseover="showPin = true"
            @mouseleave="showPin = false"
            @mousedown.stop="startDragNewObject($event, pinnedObject)"
            @mouseup.stop="cancelDragNewObject()"
          >
            <i v-if="!containsSvg(pinnedObject.icon)" :class="pinnedObject.icon" class="fa-lg"/>
            <img v-else class="node-types__item__icon" :src="pinnedObject.icon" :alt="$t(pinnedObject.label)">
            <span>{{ $t(pinnedObject.label) }}</span>
            <img
              :src="pinFillIcon"
              class="pinIcon"
              alt="Pin/Unpin Element"
              @click="unPin(pinnedObject)"
              @mousedown.stop="cancelDragNewObject()"
            >
          </div>
        </template>
      </div>
      <div class="objectCategory">
        <p>{{ $t('Object Category') }}</p>
        <template v-for="nodeType in unpinnedObjects">
          <div
            class="node-types__item"
            :class="{'node-types__item__highlight': nodeType.type === 'processmaker-ai-assistant'}"
            :data-test="nodeType.type"
            :key="nodeType.id"
            @mouseover="showPin = true"
            @mouseleave="showPin = false"
            @mousedown.stop="startDragNewObject($event, nodeType)"
            @mouseup.stop="cancelDragNewObject()"
          >
            <i v-if="!containsSvg(nodeType.icon)" :class="nodeType.icon" class="fa-lg"/>
            <img v-else class="node-types__item__icon" :src="nodeType.icon" :alt="$t(nodeType.label)">
            <span>{{ $t(nodeType.label) }}</span>
            <img
              :src="pinIcon"
              class="pinIcon"
              alt="Pin/Unpin Element"
              @click="addPin(nodeType)"
              @mousedown.stop="cancelDragNewObject()"
            >
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
#nodeTypesList {
  .pinnedObjects {
    margin-bottom: 1rem;
  }
}
.node-types {
  &__item {
    display: flex;
    padding: 0.5rem 0.3rem;
    align-items: center;
    border-radius: 4px;
    user-select: none;
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
    &__highlight {
      background-color: #FFF4D3;
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
