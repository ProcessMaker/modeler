<template>
  <nav id="breadcrumbs">
    <ol v-if="breadcrumbData.length > 0" class="breadcrumb">
      <li class="breadcrumb-item">
        <a href="/"><i class="fas fa-home" /></a>
      </li>
      <li class="breadcrumb-item" v-for="(breadcrumb, index) in breadcrumbData[0]" :key="index">
        <a :href="breadcrumb.url" v-if="breadcrumb.url">{{ breadcrumb.text }}</a>
        <span v-if="!breadcrumb.url">{{ breadcrumb.text }}</span>
      </li>
    </ol>
  </nav>
</template>
<script>
export default {
  name: 'breadcrumb',
  props: {
    breadcrumbData: { type: Array, default: () => []},
  },
};
</script>
<style lang="css" scoped>
@media screen and (max-width: 1365px) {
  #breadcrumbs {
    width: 290px;
  }
}
</style>
