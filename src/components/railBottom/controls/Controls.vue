<template>
  <ul class="control-list">
    <li 
      v-for="(item, key) in controlList"
      :class="{ 'control-item active': item.isActive, 'control-item': !item.isActive }"
      :id="item.id"
      :key="key"
      @click="onClickHandler($event, item)"
    >
      <SubmenuPopper 
        :data="item" 
        @clickToSubmenu="clickToSubmenuHandler"  
      />
    </li>

    <li class="control-item">
      <div class="control-add" :title="$t('Add')" v-b-tooltip.hover>
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
          bpmnType: 'bpmn:StartEvent',
          type: 'processmaker-modeler-start-event',
          rank: 10,
          isActive: false,
          items: [
            {
              iconSrc: require('@/assets/toolpanel/start-event.svg'),
              label: this.$t('Start Event'),
              id: 'genericStartEvent',
              bpmnType: 'bpmn:StartEvent',
              type: 'processmaker-modeler-start-event',
              rank: 10,
              isActive: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/message-start-event.svg'),
              label: this.$t('Message Start Event'),
              id: 'messageStartEvent',
              type: 'processmaker-modeler-message-start-event',
              bpmnType: 'bpmn:StartEvent',
              isActive: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/conditional-start-event.svg'),
              label: this.$t('Conditional Start Event'),
              id: 'conditionalStartEvent',
              bpmnType: 'bpmn:StartEvent',
              type: 'processmaker-modeler-conditional-start-event',
              isActive: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/signal-start-event.svg'),
              label: this.$t('Signal Start Event'),
              id: 'signalStartEvent',
              bpmnType: 'bpmn:StartEvent',
              type: 'processmaker-modeler-signal-start-event',
              isActive: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/timer-start-event.svg'),
              label: this.$t('Start Timer Event'),
              id: 'timerStartEvent',
              bpmnType: 'bpmn:StartEvent',
              type: 'processmaker-modeler-start-timer-event',
              isActive: false,
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/generic-intermediate-event.svg'),
          label: this.$t('Intermediate Event'),
          id: 'intermediateEvent',
          isActive: false,
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
      wasClicked: false,
      element: null,
      isActive: false,
    };
  },
  methods: {
    clickToSubmenuHandler(data){
      window.ProcessMaker.EventBus.$off('custom-pointerclick');
      this.wasClicked = false;
      this.parent = this.element;
      this.element = null;
      this.onClickHandler(data.event, data.control);
    },
    onClickHandler(event, control) {
      if (!this.wasClicked && !this.element) {  
        this.wasClicked = true;
        this.element = control;
        this.$emit('onSetCursor', 'crosshair');
        event.preventDefault();
        this.element.isActive = true;
        window.ProcessMaker.EventBus.$on('custom-pointerclick', message => {
          window.ProcessMaker.EventBus.$off('custom-pointerclick');
          this.onCreateElement(message);
        });
      }
    },
    onCreateElement(event){
      if (this.wasClicked && this.element) {
        this.element.isActive = false;
        if (this.parent) {
          this.parent.isActive = false;
        }
        this.$emit('onCreateElement', { event, control: this.element });
        this.$emit('onSetCursor', 'none');
        event.preventDefault();
        this.wasClicked = false;
        this.element = null;
      } 
    },
  },
});

</script>

<style lang="scss" scoped src="./controls.scss"></style>
