<script>
Vue.filter('str_limit', function (value, size) {
  if (!value) return '';
  value = value.toString();

  if (value.length <= size) {
    return value;
  }
  return value.substr(0, size) + '...';
});

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
          <i v-if="!svgIcon" :class="object.icon"/>
          <img v-else class="node-types__item__icon" :src="object.icon" :alt="$t(object.label)">
          <label>{{ $t(object.label) }}</label>
          <span class="d-block">{{ object.description | str_limit(35) }}</span>
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
            <i v-if="!svgIcon" :class="nodeType.icon"/>
            <img v-else class="node-types__item__icon" :src="nodeType.icon" :alt="$t(nodeType.label)">
            <label>{{ $t(nodeType.label) }}</label>
            <span class="d-block">{{ nodeType.description | str_limit(35) }}</span>
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
      margin-left: 0.8rem;
      font-size: 14px;
      line-height: 8px;
    }
    span {
      margin-left: 1.6rem;
      font-size: 13px;
      color:#6C757D;
    }
  }
}
</style>
