<template>
  <b-card
    no-body
    class="position-absolute m-2 border-0 flex-grow-0 border-radius-13"
    :style="{top: position.y + 'px', left: position.x + 'px' }"
    v-show="isVisible"
    @mouseover="mouseOver"
    @mouseleave="mouseLeave"
  >
    <div class="d-flex card-styling">
      <div class="card-number">
        <div class="icon">{{ number }}</div>
      </div>
      <div class="p-3 card-documentation flex-grow-1 border">
        <div class="d-flex justify-content-between">
          <div class="mt-1 element-type">
            <img v-show="iconType" 
              class="mr-1 bpmn-icon" 
              :src="iconType" 
              :alt="$t('BPMN icon')"
            >
            <span class="text-capitalize">
              {{ elementType }}
            </span>
          </div>
        </div>
        <div class="mt-1 element-title">{{ elementTitle }}</div>
        <div class="mb-2 pl-1 element-description text-justify" v-html="text" />
      </div>
    </div>
  </b-card>
</template>

<script>

import { escape as lodashEscape } from 'lodash';

export default {
  name: 'NodeDocumentation',
  data() {
    return {
      isVisible: false,
      text: '',
      number: 0,
      elementType: '',
      elementTitle: '',
      position: {
        x: 0,
        y: 0,
      },
      event: null,
      startEventIcon: require('./../../assets/documenting/start_event.svg'),
      endEventIcon: require('./../../assets/documenting/end_event.svg'),
      intermediateEventIcon: require('./../../assets/documenting/intermediate_event.svg'),
      taskIcon: require('./../../assets/documenting/task.svg'),
      gatewayIcon: require('./../../assets/documenting/gateway.svg'),
    };
  },
  methods: {
    safeString: (string) => {
      return lodashEscape(string.replace(/<\/[^>]+(>|$)/g, ''));
    },
    mouseOver() {
      window.ProcessMaker.EventBus.$emit('show-documentation', this.event);
    },
    mouseLeave() {
      window.ProcessMaker.EventBus.$emit('hide-documentation');
    },
  },
  computed: {
    iconType() {
      switch (this.elementType) {
        case 'StartEvent':
          return this.startEventIcon;
        case 'EndEvent':
          return this.endEventIcon;
        case 'IntermediateEvent':
          return this.intermediateEventIcon;
        case 'Task':
          return this.taskIcon;
        case 'ServiceTask':
          return this.taskIcon;
        case 'ExclusiveGateway':
          return this.gatewayIcon;
        case 'ParallelGateway':
          return this.gatewayIcon;
        case 'InclusiveGateway':
          return this.gatewayIcon;
        default:
          return '';
      }
    },
  },
};
</script>

<style scoped>
.card-styling {
  min-height: 140px;
  min-width: 350px;
}
.border-radius-13 {
  border-radius: 13 !important;
}
.card-number {
  display: flex;
  background: #cdddee;
  width: 50px;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  gap: 10px;
  order: 0;
  border-radius: 10px 0 0 10px;
}
.icon {
  background: #1572c2;
  color: white;
  font-family: "Open Sans", sans-serif;
  font-size: 20px;
  font-weight: 700;
  width: 35px;
  height: 35px;
  align-items: center;
  text-align: center;
  vertical-align: middle;
  border-radius: 100%;
  padding-top: 2px;
}

.bpmn-icon {
  width: 1.25em;
}

.card-documentation {
  background: white;
  border-radius: 0 10px 10px 0;
}

.element-type {
  display: inline-block;
  height: 30px;
  text-align: left;
  font-family: "Open Sans", serif;
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.02em;
  color: #556271;
  padding: 4px 7px;
  gap: 8px;
  background: #ebeff4;
  border-radius: 4px;
}

.element-title {
  height: 36px;
  padding: 5px 0 0 5px;
  font-family: "Open Sans", serif;
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 25px;
  letter-spacing: -0.02em;
  color: #556271;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

.element-description {
  font-family: "Open Sans", serif;
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  letter-spacing: -0.02em;
  color: #556271;
}
</style>
