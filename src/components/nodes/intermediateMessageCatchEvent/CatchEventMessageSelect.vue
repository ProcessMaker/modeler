<template>
  <form-select
    v-bind="$attrs"
    v-on="$listeners"
    :disabled="messagesList.length === 0"
    :options="messagesList"
    class="p-0 mb-2"
  />
</template>

<script>
import store from '@/store';
import { getMessagesList } from './intermediateMessageCatchEventUtils';

export default {
  inheritAttrs: false,
  props: ['value'],
  computed: {
    messagesList() {
      return getMessagesList(store);
    },
  },
};
</script>
