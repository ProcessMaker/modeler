<template>
  <div>
    <div class="d-flex justify-content-between align-items-end mb-2">
      <label class="m-0">{{ $t(label) }}</label>
      <button
        v-b-modal.documentation-modal
        type="button"
        :aria-label="$t('Expand')"
        class="btn-sm float-right"
        data-test="documentation-modal-button"
      >
        <i class="fas fa-expand" />
      </button>
    </div>

    <form-text-area
      id="documentation-editor"
      :value="textValue"
      :richtext="true"
      class="documentation-input d-flex"
      data-test="documentation-text-area"
      @input="$emit('input', $event)"
    />

    <b-modal
      v-cloak
      id="documentation-modal"
      size="lg"
      centered
      :title="$t('Description')"
      header-close-content="&times;"
      ok-only
      ok-variant="secondary"
      ok-title="Close"
      no-enforce-focus
    >
      <form-text-area
        id="documentation-editor-modal"
        rows="5"
        :value="textValue"
        :richtext="true"
        class="documentation-input"
        data-test="documentation-modal-text-area"
        @input="$emit('input', $event)"
      />
    </b-modal>
  </div>
</template>

<script>
import isString from "lodash/isString";
import get from "lodash/get";

export default {
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Array],
      default: ""
    },
    label: {
      type: String,
      default: "Description"
    }
  },
  computed: {
    textValue() {
      return isString(this.value) ? this.value : get(this.value[0], "text", "");
    }
  },
  methods: {
    emitValue(value) {
      this.$emit("input", value);
    }
  }
};
</script>

<style>
.documentation-input .richtext {
  height: auto;
  width: 100%;
}
</style>
