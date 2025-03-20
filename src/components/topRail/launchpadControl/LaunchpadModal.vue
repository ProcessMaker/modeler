<template>
  <b-modal
    ref="launchpad-modal"
    :title="$t('You have not publish your process')"
    @hide="closeModal"
  >
    <p>
      {{ $t('To proceed, please make sure to publish the process. Once the process is published, you will be redirected to the launchpad, where you can manage and track it further.') }}
    </p>
    <template #modal-footer>
      <b-button
        variant="primary"
        size="sm"
        class="float-right"
        @click="closeModal"
      >
        {{ $t('Cancel') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    show(value) {
      if (value) {
        this.$refs['launchpad-modal'].show();
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit('closeModal');
      this.$refs['launchpad-modal'].hide();
    },
  },
  showModal() {
    this.$refs['launchpad-modal'].show();
  },
};
</script>
