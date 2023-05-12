<template>
  <ul class="control-list">
    <li 
      v-for="(item, key) in controlList"
      class="control-item"
      :id="item.id"
      :key="key"
      @mousedown="onMouseDown"
    >
      <SubmenuPopper :data="item"/>
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
          items: [
            {
              iconSrc: require('@/assets/toolpanel/start-event.svg'),
              label: this.$t('Start Event'),
              id: 'genericStartEvent',
              bpmnType: 'bpmn:StartEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/message-start-event.svg'),
              label: this.$t('Message Start Event'),
              id: 'messageStartEvent',
              bpmnType: 'bpmn:StartEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/conditional-start-event.svg'),
              label: this.$t('Conditional Start Event'),
              id: 'conditionalStartEvent',
              bpmnType: 'bpmn:StartEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/signal-start-event.svg'),
              label: this.$t('Signal Start Event'),
              id: 'signalStartEvent',
              bpmnType: 'bpmn:StartEvent',
            },
            {
              iconSrc: require('@/assets/toolpanel/timer-start-event.svg'),
              label: this.$t('Start Timer Event'),
              id: 'timerStartEvent',
              bpmnType: 'bpmn:StartEvent',
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
      dragStart: null,
      isDragging: false,
    };
  },
  methods: {
    onMouseDown(event, control) {
      // eslint-disable-next-line no-console
      console.log('onMouseDown');

      this.draggingControl = control;
      this.isDragging = false;
      document.addEventListener('mousemove', this.setDraggingPosition);
      document.addEventListener('mouseup', this.dropElement);
      document.addEventListener('keyup', this.stopDrag);
      // this.draggingControl = control;
      this.dragStart = { 
        x: event.clientX,
        y: event.clientY,
      };
      // eslint-disable-next-line no-console
      console.log('onMouseDown',this.dragStart);
      this.setDraggingPosition(event);
    },
    stopDrag(event) {
      if (event && event.key !== 'Escape') {
        return;
      }

      document.removeEventListener('mousemove', this.setDraggingPosition);
      document.removeEventListener('mouseup', this.dropElement);
      document.removeEventListener('keyup', this.stopDrag);

      // document.body.removeChild(this.draggingElement);
      this.draggingElement = null;
      this.draggingControl = null;
    },
    dropElement({ clientX, clientY }) {
      if (!this.isDragging && this.dragStart) {
        // is clicked over the shape
        // eslint-disable-next-line no-console
        console.log('clicked');
      } else {
        // eslint-disable-next-line no-console
        console.log('dropElement x,y :', clientX, clientY);
      }
     
      this.isDragging = false;
      this.dragStart = null;
      // this.$emit('handleDrop', { clientX, clientY, control: this.draggingControl });
      this.stopDrag();
      // this.dragStart = null;
    },
    setDraggingPosition({ clientX, clientY }) {
      if (this.dragStart && (Math.abs(clientX - this.dragStart.x) > 5 || Math.abs(clientY- this.dragStart.y) > 5)) {
       
        this.isDragging = true;
        this.dragStart = null;
        // eslint-disable-next-line no-console
        
      } else {
        // eslint-disable-next-line no-console
        console.log('setDraggingPosition x, y :', clientX, clientY);
      }
      // this.draggingElement.style.left = pageX - this.xOffset + 'px';
      // this.draggingElement.style.top = pageY - this.yOffset + 'px';
      // eslint-disable-next-line no-console
      
      // this.$emit('drag', { clientX, clientY, control: this.draggingControl });
    },
    onMouseUp() {
      // eslint-disable-next-line no-console
      console.log('onMouseUp');
    },
  },
});

</script>

<style lang="scss" scoped src="./controls.scss"></style>
