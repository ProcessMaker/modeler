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
          <img class="node-types__item__icon" :src="object.icon" :alt="$t(object.label)">
          <span>{{ $t(object.label) }}</span>
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
            <label>{{ $t(nodeType.label) }}</label>
            <span class="d-block">{{ nodeType.description }}</span>
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
    border-radius: 4px;
    user-select: none;
    margin-bottom: 8px;
    border: 1px solid #b6bfc6;
    &:hover {
      background-color: #EBEEF2;
    }
    label {
      font-size: 14px;
      line-height: 8px;
      font-weight: 600;
      color: #104A75;
    }
    span {
      font-size: 12px;
      color:#6C757D;
    }
  }
}
</style>
