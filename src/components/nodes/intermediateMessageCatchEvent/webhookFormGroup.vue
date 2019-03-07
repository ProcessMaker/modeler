<template>
  <div>
    <form-input
      v-model="webHook"
      label="Web Hook"
    />
    <button>Copy to clipboard</button>
  </div>
</template>

<script>

export default {
  data() {
    return {
      webHook: 'You copied',
    };
  },
  computed: {
    calledElementLabel() {
      return 'Processes';
    },
  },
  methods: {
    onChange(key, value) {
      this.$emit('input', { [key]: value });
    },
  },
};
</script>
