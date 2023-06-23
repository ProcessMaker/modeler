<script>
import nodeTypesStore from '@/nodeTypesStore';
export default {
  name: 'FilterNodeTypes',
  props: ['type'],
  data() {
    return {
      searchTerm: '',
    };
  },
  watch: {
    searchTerm(value) {
      if (this.type === 'pmBlock') {
        if (value.length === 0) nodeTypesStore.commit('clearFilteredPmBlockNodes');
        if (value.length > 0) nodeTypesStore.commit('setFilteredPmBlockNodeTypes', value);
      } else  {
        if (value.length === 0) nodeTypesStore.commit('clearFilteredNodes');
        if (value.length > 0) nodeTypesStore.commit('setFilteredNodeTypes', value);
      }
    },
  },
  computed: {
    nodeTypes() {
      const pinnedNodeTypes = nodeTypesStore.getters.getPinnedNodeTypes;
      const nodeTypes = nodeTypesStore.getters.getNodeTypes;
      return [...pinnedNodeTypes, ...nodeTypes];
    },
    pmBlockNodes() {
      const pmBlockNodeTypes = nodeTypesStore.getters.getPmBlockNodeTypes;
      return [...pmBlockNodeTypes];
    },
    placeholder() {
      return this.type === 'pmBlock' ? this.$t('Search PM Blocks') : this.$t('Search Objects');
    },
  },
};
</script>

<template>
  <div id="searchNodeTypes">
    <label class="position-relative d-block">
      <i class="fas fa-search position-absolute h-100 text-muted ml-2" />
      <b-input :placeholder="placeholder" v-model="searchTerm" />
    </label>
  </div>

</template>

<style lang="scss" scoped>
#searchNodeTypes {
  i {
    top: 27%;
  }
  input {
    border: 1px solid #5F666D;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 14px;
    line-height: 21px;
    padding-left: 30px;
    &::placeholder {
      color: #929FAC;
    }
  }
}
</style>
