<template>
  <form-select
    v-bind="$attrs"
    v-on="$listeners"
    :disabled="messagesList.length === 0"
    :options="dropdownList"
    class="p-0 mb-2"
  />
</template>

<script>
import store from '@/store';

export default {
  inheritAttrs: false,
  props: ['value'],
  computed: {
    dropdownList() {
      return this.messagesList.length > 0
        ? this.messagesList
        : [];
    },
    messagesList() {
      return store.getters.rootElements
        .filter(this.isMessageElement)
        .map(this.toDropdownFormat);
    },
  },
  methods: {
    isMessageElement(element) {
      return element.$type === 'bpmn:Message';
    },
    toDropdownFormat(element) {
      return {
        value: element.get('id'),
        content: element.get('name'),
      };
    },
  },
};
</script>
