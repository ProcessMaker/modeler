<template>
  <ul class="control-list">
    <li class="control-item">
      <div class="control-item-options">
        <span />
      </div>
      <img src="/img/start-event.e895cee2.svg" alt="Start Event">
    </li>

    <li class="control-item">
      <div class="control-item-options">
        <span />
      </div>
      <img src="/img/generic-intermediate-event.ba2e1d71.svg" alt="Intermediate Event">
    </li>

    <li class="control-item">
      <div class="control-item-options">
        <span />
      </div>
      <img src="/img/end-event.1ad31396.svg" alt="End vent">
    </li>

    <li class="control-item">
      <div class="control-item-options">
        <span />
      </div>
      <img src="/img/task.e7419065.svg" alt="Task">
    </li>

    <li class="control-item">
      <div class="control-item-options">
        <span />
      </div>
      <img src="/img/generic-gateway.3a76fc75.svg" alt="Gateway">
    </li>

    <li class="control-item">
      <img src="/img/pool.ac62ddae.svg" alt="Pool">
    </li>

    <li class="control-item">
      <div class="control-add">
        <img :src="plusIcon" :alt="$t('Add')">
      </div>
    </li>
  </ul>
</template>

<script>
export default ({
  data() {
    return {
      plusIcon: require('@/assets/railBottom/plus-lg-light.svg'),
    };
  },
});

</script>

<style lang="scss" scoped src="./controls.scss"></style>
