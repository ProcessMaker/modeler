<template>
  <div>
    <ul class="control-list">

      <li v-for="(item, key) in controlList" class="control-item" :id="item.id" :key="key">
        <SubmenuPopper :data="item"/>
      </li>

      <li class="control-item">
        <div class="control-add">
          <img :src="plusIcon" :alt="$t('Add')">
        </div>
      </li>
    </ul>
    
  </div>

</template>

<script>
import SubmenuPopper from './SubmenuPopper/SubmenuPopper.vue';
export default ({
  components: {
    SubmenuPopper,
  },
  data() {
    return {
      controlList:[
        {
          iconSrc: require('@/assets/toolpanel/start-event.svg'),
          label: this.$t('Start Event'),
          id: 'startEvent',
          items: [
            {
              iconSrc: require('@/assets/toolpanel/start-event.svg'),
              label: this.$t('Start Event'),    
              id: 'genericStartEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/message-start-event.svg'),
              label: this.$t('Message Start Event'),    
              id: 'messageStartEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/conditional-start-event.svg'),
              label: this.$t('Conditional Start Event'),    
              id: 'conditionalStartEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/signal-start-event.svg'),
              label: this.$t('Signal Start Event'),    
              id: 'signalStartEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/timer-start-event.svg'),
              label: this.$t('Start Timer Event'),    
              id: 'timerStartEvent',
            },
          ],
        },
        {
          // iconSrc: '/img/generic-intermediate-event.ba2e1d71.svg',
          iconSrc: require('@/assets/toolpanel/generic-intermediate-event.svg'),
          label: this.$t('Intermediate Event'),
          id: 'intermediateEvent',
        },
        {
          // iconSrc: '/img/end-event.1ad31396.svg',
          iconSrc: require('@/assets/toolpanel/end-event.svg'),
          label: this.$t('End Event'),
          id: 'endEvent',
        },
        {
          // iconSrc: '/img/task.e7419065.svg',
          iconSrc: require('@/assets/toolpanel/task.svg'),
          label: this.$t('Task'),
          id: 'task',
        },
        {
          //iconSrc: '/img/generic-gateway.3a76fc75.svg',
          iconSrc: require('@/assets/toolpanel/generic-gateway.svg'),
          label: this.$t('Gateway'),
          id: 'gateway',
        },
        {
          // iconSrc: '/img/pool.ac62ddae.svg',
          iconSrc: require('@/assets/toolpanel/pool.svg'),
          label: this.$t('Pool'),
          id: 'pool',
        },
      ],
      plusIcon: require('@/assets/railBottom/plus-lg-light.svg'),
    };
  },
});

</script>

<style lang="scss" scoped src="./controls.scss"></style>
