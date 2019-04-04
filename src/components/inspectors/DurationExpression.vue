<template>
  <div class="form-group">
    <label>Delay</label>
    <pre>{{ value }}</pre>
    <div>
      <input type="number" min="1" class="form-control control repeat" :data-test="repeatInput" v-model="repeat">
      <select v-model="periodicity" class="form-control control periodicity">
        <option value="D">day</option>
        <option value="W">week</option>
        <option value="M">month</option>
        <option value="Y">year</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  props: ['value', 'repeatInput'],
  data() {
    return {
      repeat: null,
      periodicity: null,
    };
  },
  watch: {
    value: {
      handler(value) {
        this.repeat = parseInt(value.substring(1));
        this.periodicity = value[value.length - 1];
      },
      immediate: true,
    },
    durationExpression(durationExpression) {
      this.$emit('input', durationExpression);
    },
  },
  computed: {
    durationExpression() {
      return `P${this.repeat}${this.periodicity}`;
    },
  },
};
</script>

<style scoped="scoped">
.control {
  vertical-align: middle;
  display: inline-block;
  height: 3em;
  font-size: 1em;
}
.repeat {
  width: 6em !important;
  text-align: right;
}
.periodicity {
  width: 6em;
}
</style>
