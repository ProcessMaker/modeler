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
      elementImplementation: '',
      elementCalledElement: '',
      elementConfig: '',
      position: {
        x: 0,
        y: 0,
      },
      event: null,
      actionsByEmailIcon: require('./../../assets/documenting/action-by-email.svg'),
      bamboohrIcon: require('./../../assets/documenting/bamboohr.svg'),
      dataConnectorIcon: require('./../../assets/documenting/data-connector.svg'),
      dataObjectIcon: require('./../../assets/documenting/data-object.svg'),
      dataStoreIcon: require('./../../assets/documenting/data-store.svg'),
      docusignIcon: require('./../../assets/documenting/docusign.svg'),
      endEventIcon: require('./../../assets/documenting/end-event.svg'),
      flowgenieIcon: require('./../../assets/documenting/flowgenie.svg'),
      genericGatewayIcon: require('./../../assets/documenting/generic-gateway.svg'),
      githubIcon: require('./../../assets/documenting/github.svg'),
      idpIcon: require('./../../assets/documenting/idp.svg'),
      intermediateEventIcon: require('./../../assets/documenting/intermediate-event.svg'),
      pdfIcon: require('./../../assets/documenting/pdf.svg'),
      poolIcon: require('./../../assets/documenting/pool.svg'),
      sendEmailIcon: require('./../../assets/documenting/send-email.svg'),
      slackNotificationIcon: require('./../../assets/documenting/slack-notification.svg'),
      slackIcon: require('./../../assets/documenting/slack.svg'),
      startEventIcon: require('./../../assets/documenting/start-event.svg'),
      tableIcon: require('./../../assets/documenting/table.svg'),
      taskIcon: require('./../../assets/documenting/task.svg'),
      textAnnotationIcon: require('./../../assets/documenting/text-annotation.svg'),
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
    getImplementationIcon() {
      switch (this.elementImplementation) {
        case 'connector-send-email/processmaker-communication-email-send':
          return this.sendEmailIcon;
        case 'connector-slack/processmaker-communication-slack':
          return this.slackIcon;
        case 'package-decision-engine/decision-table':
          return this.tableIcon;
        case 'package-rpa/processmaker-communication-rpa':
          return this.taskIcon;
        case 'package-data-sources/data-source-task-service':
          return this.dataConnectorIcon;
        case 'package-ai/processmaker-ai-task':
        case 'package-ai/processmaker-ai-assistant':
          return this.flowgenieIcon;
        case 'connector-pdf-print/processmaker-communication-pdf-print':
          return this.pdfIcon;
        case 'connector-idp/processmaker-communication-idp':
          return this.idpIcon;
        default:
          return this.taskIcon;
      }
    },
    getCalledElementIcon() {
      if (this.elementCalledElement === 'ProcessId-DocuSignSendEnvelope') {
        return this.docusignIcon;
      }

      let parsedConfig = null;

      if (this.elementConfig) {
        parsedConfig = JSON.parse(this.elementConfig);  
      }
      
      if (parsedConfig && parsedConfig.options) {
        return this.actionsByEmailIcon;
      }

      return this.taskIcon;
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
          return this.endEventIcon;
        case 'Task':
        case 'CallActivity':
          return this.getCalledElementIcon();
        case 'ServiceTask':
          return this.getImplementationIcon();
        case 'ExclusiveGateway':
          return this.gatewayIcon;
        case 'ParallelGateway':
          return this.gatewayIcon;
        case 'InclusiveGateway':
          return this.gatewayIcon;
        case 'DataStoreReference':
          return this.dataStoreIcon;
        case 'DataObjectReference':
          return this.dataObjectIcon;
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
