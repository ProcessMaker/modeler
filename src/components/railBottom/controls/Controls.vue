<template>
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
          iconSrc: require('@/assets/toolpanel/generic-intermediate-event.svg'),
          label: this.$t('Intermediate Event'),
          id: 'intermediateEvent',
          items: [
            {
              iconSrc: require('@/assets/toolpanel/intermediate-timer-event.svg'),
              label: this.$t('Intermediate Timer Event'),    
              id: 'intermediateTimerEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-signal-catch-event.svg'),
              label: this.$t('Intermediate Signal Catch Event'),    
              id: 'intermediateSignalCatchEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-signal-throw-event.svg'),
              label: this.$t('Intermediate Signal Throw Event'),    
              id: 'intermediateSignalThrowEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-message-catch-event.svg'),
              label: this.$t('Intermediate Message Catch Event'),    
              id: 'intermediateMessageCatchEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-message-throw-event.svg'),
              label: this.$t('Intermediate Message Throw Event'),    
              id: 'intermediateMessageThrowEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-conditional-catch-event.svg'),
              label: this.$t('Intermediate Conditional Catch Event'),    
              id: 'intermediateConditionalCatchEvent',
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/end-event.svg'),
          label: this.$t('End Event'),
          id: 'endEvent',
          items: [
            {
              iconSrc: require('@/assets/toolpanel/end-event.svg'),
              label: this.$t('End Event'),    
              id: 'genericEndEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/message-end-event.svg'),
              label: this.$t('Message End Event'),    
              id: 'messageEndEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/end-event.svg'),
              label: this.$t('Error End Event'),    
              id: 'errorEndEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/signal-end-event.svg'),
              label: this.$t('Signal End Event'),    
              id: 'signalEndEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/terminate-end-event.svg'),
              label: this.$t('Terminate End Event'),    
              id: 'terminateEndEvent',
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/task.svg'),
          label: this.$t('Form Task'),
          id: 'task',
          items: [
            {
              iconSrc: require('@/assets/toolpanel/task.svg'),
              label: this.$t('Form Task'),    
              id: 'formTask',
            },
            {
              iconSrc: require('@/assets/toolpanel/manual-task.svg'),
              label: this.$t('Manual Task'),    
              id: 'manualTask',
            },
            {
              iconSrc: require('@/assets/toolpanel/script-task.svg'),
              label: this.$t('Script Task'),    
              id: 'script',
            },
            {
              iconSrc: require('@/assets/toolpanel/task.svg'),
              label: this.$t('Sub Process'),    
              id: 'subProcess',
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/generic-gateway.svg'),
          label: this.$t('Gateway'),
          id: 'gateway',
          items: [
            {
              iconSrc: require('@/assets/toolpanel/exclusive-gateway.svg'),
              label: this.$t('Exclusive Gateway'),    
              id: 'exclusiveGateway',
            },
            {
              iconSrc: require('@/assets/toolpanel/inclusive-gateway.svg'),
              label: this.$t('Inclusive Gateway'),    
              id: 'inclusiveGateway',
            },
            {
              iconSrc: require('@/assets/toolpanel/parallel-gateway.svg'),
              label: this.$t('Parallel Gateway'),    
              id: 'parallelGateway',
            },
            {
              iconSrc: require('@/assets/toolpanel/generic-gateway.svg'),
              label: this.$t('Event Based Gateway'),    
              id: 'eventBasedGateway',
            },
            
          ],
        },
        
        {
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
