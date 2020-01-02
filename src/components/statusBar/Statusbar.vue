<template>
  <div class="statusbar d-flex align-items-center justify-content-between pr-3 border-top">
    <div>
      <slot name="secondary" />
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>
<style lang="scss" src="./statusBar.scss" scoped />
