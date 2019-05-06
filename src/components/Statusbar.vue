<template>
  <div class="statusbar">
    <div>
      <slot name="secondary"/>
    </div>
    <div>
      <slot/>
    </div>
  </div>
</template>

<script>
export default {

};
</script>

<style scoped>
.statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #eeeeee;
  padding-left: 16px;
  padding-right: 16px;
  font-size: 14px;
  color: #555555;
  font-weight: normal;
}
</style>


