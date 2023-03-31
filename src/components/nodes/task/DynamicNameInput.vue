<template>
  <div>
    <form-input v-model="name" :label="$t('Dynamic Name')" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      config: {},
    };
  },
  props: ['value'],
  computed: {},
  created() {
    this.loadBpmnValues();
  },
  watch: {
    name() {
      this.setBpmnValues();
    },
    value: {
      immediate: true,
      handler() {
        this.config = JSON.parse(this.value);
      },
    },
  },
  methods: {
    loadBpmnValues() {
      this.name = this.config.dynamic_name;
    },
    setBpmnValues() {
      const emit = {
        dynamic_name: this.name,
      };
      const stringValue = JSON.stringify(emit);
      this.$emit('input', stringValue);
    },
  },
};
</script>
