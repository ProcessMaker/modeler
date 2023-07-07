<script>
import nodeTypesStore from '@/nodeTypesStore';
import clickAndDrop from '@/mixins/clickAndDrop';

export default {
  name: 'PmBlocksLoop',
  mixins: [clickAndDrop],
  computed: {
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
          :key="object.id"
          @click.stop="onClickHandler($event, object)"
        >
          <div class="d-flex">
            <i v-if="!object.svgIcon" class="node-types__item__icon" :class="object.customIcon"/>
            <img v-else class="node-types__item__icon" :src="object.svgIcon" :alt="$t(object.label)">
            <label>{{ $t(object.label) }}</label>
          </div>
        </div>
      </template>
    </div>
    <template v-if="filteredPmBlockNodes.length === 0 && !searchTerm">
      <div class="pmBlocksContainer p-2">
        <template v-for="nodeType in pmBlockNodeTypes">
          <div
            class="pm-block-node-types__item p-2 d-block"
            :key="nodeType.id"
            @click.stop="onClickHandler($event, nodeType)"
          >
            <div class="d-flex">
              <i v-if="!nodeType.svgIcon" class="node-types__item__icon" :class="nodeType.customIcon"/>
              <img v-else class="node-types__item__icon" :src="nodeType.svgIcon" :alt="$t(nodeType.label)">
              <label>{{ $t(nodeType.label) }}</label>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
.pm-block-node-types {
  &__item {
    display: block;
    padding: 0.5rem 0.3rem;
    border-radius: 4px;
    user-select: none;
    margin-bottom: 8px;
    &:hover {
      background-color: #EBEEF2;
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
  }
}
</style>
