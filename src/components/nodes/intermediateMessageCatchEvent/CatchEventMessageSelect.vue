<template>
  <form-select
    v-bind="$attrs"
    :value="messageId"
    @input="emitMessage"
    :disabled="messagesList.length === 0"
    :options="messagesList"
    class="p-0 mb-2"
  />
</template>

<script>
import store from '@/store';
import { getMessagesList, getMessage } from './intermediateMessageCatchEventUtils';

export default {
  inheritAttrs: false,
  props: ['value'],
  computed: {
    messagesList() {
      return getMessagesList(store);
    },
    messageId() {
      return this.value ? this.value.id : '';
    },
  },
  methods: {
    emitMessage(messageId) {
      const message = getMessage(store, messageId);
      this.$emit('input', message);
    },
  },
};
</script>
