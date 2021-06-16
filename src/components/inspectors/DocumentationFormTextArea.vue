<template>
  <div>
    <div class="d-flex justify-content-between align-items-end mb-2">
      <label class="m-0">{{ $t(label) }}</label>
      <button type="button" :aria-label="$t('Expand')" v-b-modal.documentation-modal class="btn-sm float-right" data-test="documentation-modal-button"><i class="fas fa-expand"/></button>
    </div>

    <form-text-area
      :value="textValue"
      :richtext="true"
      class="documentation-input d-flex"
      data-test="documentation-text-area"
      id="documentation-editor"
      @input="$emit('input', $event)"
    />

    <b-modal
      id="documentation-modal"
      size="lg"
      centered
      :title="$t('Description')"
      v-cloak
      header-close-content="&times;"
      ok-only
      ok-variant="secondary"
      ok-title="Close"
      no-enforce-focus
    >
      <form-text-area
        rows="5"
        :value="textValue"
        :richtext="true"
        class="documentation-input"
        data-test="documentation-modal-text-area"
        id="documentation-editor-modal"
        @input="$emit('input', $event)"
      />
    </b-modal>
  </div>
</template>

<script>
import isString from 'lodash/isString';
import get from 'lodash/get';

export default {
  props: {
    value: {
      type: [String, Array],
      default: '',
    },
    label: {
      type: String,
      default: 'Description',
    },
  },
  inheritAttrs: false,
  computed: {
    textValue() {
      return isString(this.value)
        ? this.value
        : get(this.value[0], 'text', '');
    },
  },
  methods: {
    emitValue(value) {
      this.$emit('input', value);
    },
  },
};
</script>

<style>
  .documentation-input .richtext {
    height: auto;
    width: 100%;
  }
</style>
