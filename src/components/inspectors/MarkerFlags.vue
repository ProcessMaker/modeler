<template>
  <div>
    <b-form-group>
      <b-form-checkbox v-model="isForCompensation" data-test="for-compensation" name="for-compensation">{{
          $t("For Compensation")
        }}
      </b-form-checkbox>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: "MarkerFlags",
  props: {
    value: {
      type: Object,
      default() {
        return {
          isForCompensation: false
        };
      }
    }
  },
  data() {
    return {
      isForCompensation: this.value.isForCompensation
    };
  },
  watch: {
    isForCompensation(newVal) {
      this.$emit("input", { isForCompensation: newVal });
    }
  }
};
</script>

<style scoped></style>
