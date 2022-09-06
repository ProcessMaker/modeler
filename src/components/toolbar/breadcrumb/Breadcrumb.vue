<template>
  <nav id="breadcrumbs">
    <ol v-if="breadcrumbData.length > 0" class="breadcrumb">
      <li class="breadcrumb-item">
        <a href="/"><i class="fas fa-home" /></a>
      </li>
      <li v-for="(breadcrumb, index) in breadcrumbData[0]" :key="index" class="breadcrumb-item">
        <a v-if="breadcrumb.url" :href="breadcrumb.url">{{ breadcrumb.text }}</a>
        <span v-if="!breadcrumb.url">{{ breadcrumb.text }}</span>
      </li>
    </ol>
  </nav>
</template>
<script>
export default {
  name: "Breadcrumb",
  props: {
    breadcrumbData: { type: Array, default: () => [] },
  },
};
</script>
