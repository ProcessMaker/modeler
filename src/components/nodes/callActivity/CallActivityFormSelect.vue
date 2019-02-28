<template>
  <form-select
    v-bind="$attrs"
    v-on="$listeners"
    :disabled="processList == null"
    :options="processList"
  />
</template>

<script>
import store from '@/store';
import { id as poolId } from '@/components/nodes/pool';

export default {
  computed: {
    processList() {
      const processList = store.getters.nodes
        .filter(({ type }) => type === poolId)
        .map(pool => ({
          value: pool.definition.get('processRef').get('id'),
          content: pool.definition.get('name'),
        }));

      return processList.length > 0
        ? processList
        : null;
    },
  },
};
</script>
