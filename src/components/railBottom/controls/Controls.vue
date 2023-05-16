<template>
  <ul
    v-if="controls"
    class="control-list"
  >

    <li 
      v-for="(item, key) in controls"
      :class="{ 'control-item active': item.active, 'control-item': !item.active }"
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
import { BOTTOM } from '@/components/controls/rankConstants';
import SubmenuPopper from './SubmenuPopper/SubmenuPopper.vue';
export default ({
  components: {
    SubmenuPopper,
  },
  props: {
    nodeTypes: Array,
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
          active: false,
          items: [
            {
              iconSrc: require('@/assets/toolpanel/start-event.svg'),
              label: this.$t('Start Event'),
              id: 'genericStartEvent',
              bpmnType: 'bpmn:StartEvent',
              rank: 10,
              type: 'processmaker-modeler-start-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/message-start-event.svg'),
              label: this.$t('Message Start Event'),
              id: 'messageStartEvent',
              bpmnType: 'bpmn:StartEvent',
              rank: 10,
              type: 'processmaker-modeler-message-start-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/conditional-start-event.svg'),
              label: this.$t('Conditional Start Event'),
              id: 'conditionalStartEvent',
              bpmnType: 'bpmn:StartEvent',
              rank: 10,
              type: 'processmaker-modeler-conditional-start-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/signal-start-event.svg'),
              label: this.$t('Signal Start Event'),
              id: 'signalStartEvent',
              bpmnType: 'bpmn:StartEvent',
              rank: 10,
              type: 'processmaker-modeler-signal-start-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/timer-start-event.svg'),
              label: this.$t('Start Timer Event'),
              id: 'timerStartEvent',
              bpmnType: 'bpmn:StartEvent',
              rank: 10,
              type: 'processmaker-modeler-start-timer-event',
              active: false,
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/generic-intermediate-event.svg'),
          label: this.$t('Intermediate Event'),
          id: 'intermediateEvent',
          rank: 20,
          type: 'processmaker-modeler-intermediate-catch-timer-event',
          active: false,
          items: [
            {
              iconSrc: require('@/assets/toolpanel/intermediate-timer-event.svg'),
              label: this.$t('Intermediate Timer Event'),
              id: 'intermediateTimerEvent',
              rank: 20,
              type: 'processmaker-modeler-intermediate-catch-timer-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-signal-catch-event.svg'),
              label: this.$t('Intermediate Signal Catch Event'),
              id: 'intermediateSignalCatchEvent',
              rank: 20,
              type: 'processmaker-modeler-intermediate-signal-catch-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-signal-throw-event.svg'),
              label: this.$t('Intermediate Signal Throw Event'),
              id: 'intermediateSignalThrowEvent',
              rank: 20,
              type: 'processmaker-modeler-intermediate-signal-throw-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-message-catch-event.svg'),
              label: this.$t('Intermediate Message Catch Event'),
              id: 'intermediateMessageCatchEvent',
              rank: 20,
              type: 'processmaker-modeler-intermediate-signal-throw-event',
              active: false,
              
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-message-throw-event.svg'),
              label: this.$t('Intermediate Message Throw Event'),
              id: 'intermediateMessageThrowEvent',
              rank: 20,
              type: 'processmaker-modeler-intermediate-message-throw-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/intermediate-conditional-catch-event.svg'),
              label: this.$t('Intermediate Conditional Catch Event'),
              id: 'intermediateConditionalCatchEvent',
              rank: 20,
              type: 'processmaker-modeler-intermediate-conditional-catch-event',
              active: false,
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/end-event.svg'),
          label: this.$t('End Event'),
          id: 'endEvent',
          rank: 30,
          type: 'processmaker-modeler-end-event',
          active: false,
          items: [
            {
              iconSrc: require('@/assets/toolpanel/end-event.svg'),
              label: this.$t('End Event'),
              id: 'genericEndEvent',
              rank: 30,
              type: 'processmaker-modeler-end-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/message-end-event.svg'),
              label: this.$t('Message End Event'),
              id: 'messageEndEvent',
              rank: 30,
              type: 'processmaker-modeler-message-end-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/end-event.svg'),
              label: this.$t('Error End Event'),
              id: 'errorEndEvent',
              rank: 30,
              type: 'processmaker-modeler-error-end-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/signal-end-event.svg'),
              label: this.$t('Signal End Event'),
              id: 'signalEndEvent',
              rank: 30,
              type: 'processmaker-modeler-signal-end-event',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/terminate-end-event.svg'),
              label: this.$t('Terminate End Event'),
              id: 'terminateEndEvent',
              rank: 30,
              type: 'processmaker-modeler-terminate-end-event',
              active: false,
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/task.svg'),
          label: this.$t('Form Task'),
          id: 'task',
          rank: 40,
          type: 'processmaker-modeler-task',
          active: false,
          items: [
            {
              iconSrc: require('@/assets/toolpanel/task.svg'),
              label: this.$t('Form Task'),
              id: 'formTask',
              rank: 40,
              type: 'processmaker-modeler-task',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/manual-task.svg'),
              label: this.$t('Manual Task'),
              id: 'manualTask',
              rank: 40,
              type: 'processmaker-modeler-manual-task',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/script-task.svg'),
              label: this.$t('Script Task'),
              id: 'script',
              rank: 40,
              type: 'processmaker-modeler-script-task',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/task.svg'),
              label: this.$t('Sub Process'),
              id: 'subProcess',
              rank: 40,
              type: 'processmaker-modeler-call-activity',
              active: false,
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/generic-gateway.svg'),
          label: this.$t('Gateway'),
          id: 'gateway',
          rank: 50,
          type: 'processmaker-modeler-exclusive-gateway',
          active: false,
          items: [
            {
              iconSrc: require('@/assets/toolpanel/exclusive-gateway.svg'),
              label: this.$t('Exclusive Gateway'),
              id: 'exclusiveGateway',
              rank: 50,
              type: 'processmaker-modeler-exclusive-gateway',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/inclusive-gateway.svg'),
              label: this.$t('Inclusive Gateway'),
              id: 'inclusiveGateway',
              rank: 50,
              type: 'processmaker-modeler-inclusive-gateway',
              active: false,
            },
            {
              iconSrc: require('@/assets/toolpanel/parallel-gateway.svg'),
              label: this.$t('Parallel Gateway'),
              id: 'parallelGateway',
              rank: 50,
              type: 'processmaker-modeler-parallel-gateway',
              active: false,
              
            },
            {
              iconSrc: require('@/assets/toolpanel/generic-gateway.svg'),
              label: this.$t('Event Based Gateway'),
              id: 'eventBasedGateway',
              rank: 50,
              type: 'processmaker-modeler-event-based-gateway',
              active: false,
            },
          ],
        },
        {
          iconSrc: require('@/assets/toolpanel/pool.svg'),
          label: this.$t('Pool'),
          id: 'pool',
          rank: 60,
          type: 'processmaker-modeler-pool',
        },
      ],
      plusIcon: require('@/assets/railBottom/plus-lg-light.svg'),
      wasClicked: false,
      element: null,
      isActive: false,
    };
  },
  computed: {
    controls() {
      return this.nodeTypes
        .filter(nodeType => nodeType.control)
        .map(nodeType => ({
          type: nodeType.id,
          icon: nodeType.icon,
          label: nodeType.label,
          bpmnType: nodeType.bpmnType,
          rank: nodeType.rank || BOTTOM,
          items: nodeType.items || null,
        }))
        .sort((node1, node2) => node1.rank - node2.rank);
    },
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
        this.element.active = true;
        window.ProcessMaker.EventBus.$on('custom-pointerclick', message => {
          window.ProcessMaker.EventBus.$off('custom-pointerclick');
          this.onCreateElement(message);
        });
      }
    },
    onCreateElement(event){
      if (this.wasClicked && this.element) {
        this.element.active = false;
        if (this.parent) {
          this.parent.active = false;
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
