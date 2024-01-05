<template>
  <div class="message d-flex flex-column w-100 align-items-center">
    <b-button
      class="new-process-btn d-flex flex-row px-2 py-4 align-items-center"
      @click="redirectToAiProcess()"
    >
      <div class="d-flex justify-content-between">
        <inline-svg :src="proceC2Icon" class="mx-3 my-auto ai-icon" />
        <div class="mr-2 text-left">
          <h1>Modeler Test From CI Again</h1>
          <div class="h5 m-0">{{ aiProcessButtonTitle }}</div>
          <div class="text-secondary font-weight-light small">
            <div v-if="(this.promptSessionId && this.promptSessionId !== '')" class="d-flex align-items-center">
              {{ $t('Last session by:') }}
              <avatar-image class="ml-2 mr-1 d-flex align-items-center" size="18" :input-data="lastSession" hide-name="true"/> {{ aiProcessButtonSubtitle }}
            </div>
            <div v-else>
              <span v-if="showSessionLoader">
                <i class="fa fa-spinner fa-spin"/>
              </span>
              <span>{{ aiProcessButtonSubtitle }}</span>
            </div>
            
          </div>
        </div>
      </div>
      <span class="fa fa-chevron-right mx-3" />
    </b-button>
    <div class="d-flex justify-content-center align-items-center flex-column justify-content-center">
      <div class="justify-content-center align-items-center w-100 text-center my-4">
        <div class="text-align-center d-flex text-center justify-content-center align-items-center">
          <div class="hyphen" />
          {{ $t("or") }}
          <div class="hyphen" />
        </div>
      </div>
      <div class="w-100">
        {{ $t("Click and drop objects to build the process you like.") }}
      </div>
    </div>
  </div>
</template>
<script>
import InlineSvg from 'vue-inline-svg';

export default {
  name: 'WelcomeMessage',
  components: {
    InlineSvg,
  },
  data() {
    return {
      proceC2Icon: require('@/assets/proceC2.svg'),
      lastSession: {},
      history: [],
      processId: window.ProcessMaker?.modeler?.process?.id,
    };
  },
  computed: {
    promptSessionId() {
      // Get sessions list
      let promptSessions = localStorage.getItem('promptSessions');

      // If promptSessions does not exist, set it as an empty array
      promptSessions = promptSessions ? JSON.parse(promptSessions) : [];
      let item = promptSessions.find(item => item.processId === this.processId && item.server === window.location.host);

      if (item) {
        return item.promptSessionId;
      }

      return '';
    },
    showSessionLoader() {
      if (!(!this.promptSessionId || this.promptSessionId === '') && this.lastSession.firstname === undefined) {
        return true;
      }

      return false;
    },
    aiProcessButtonTitle() {
      if (!this.promptSessionId || this.promptSessionId === '') {
        return this.$t('Create a process with AI');
      }
      return this.$t('Continue AI session');
    },
    aiProcessButtonSubtitle() {
      if (!this.promptSessionId || this.promptSessionId === '') {
        return this.$t('Kick-start an AI generated process');
      }

      return `${this.lastSession.firstname} ${this.lastSession.lastnameInitials}. | ${this.formatDateTime(this.lastSession.requestDate)}`;
    },
  },
  mounted() {
    if (!localStorage.getItem('promptSessions') || localStorage.getItem('promptSessions') === 'null') {
      localStorage.setItem('promptSessions', JSON.stringify([]));
    }

    if (this.promptSessionId && this.promptSessionId !== '') {
      this.getLastSharedHistory();
    }
  },
  methods: {
    redirectToAiProcess() {
      const processId = window.ProcessMaker.modeler.process.id ?? null;
      if (processId) {
        const url = `/package-ai/processes/create/${processId}/${processId}`;
        window.location = url;
      }
    },
    getLastSharedHistory() {
      const url = '/package-ai/getLastSharedSessionHistory';

      const params = {  
        sharedSessionId: this.promptSessionId,
      };

      window.ProcessMaker.apiClient.post(url, params)
        .then(response => {
          this.$set(this.lastSession, 'requestDate', response.data.requestDate);
          this.$set(this.lastSession, 'firstname', response.data.firstname);
          this.$set(this.lastSession, 'lastname', response.data.lastname);
          this.$set(this.lastSession, 'lastnameInitials', response.data.lastnameInitials);
          this.$set(this.lastSession, 'avatar', response.data.avatar);
        }).catch((error) => {
          const errorMsg = error.response?.data?.message || error.message;
          this.loading = false;
          window.ProcessMaker.alert(errorMsg, 'danger');
        });
    },
    formatDateTime(value) {
      let config = '';
      if (
        typeof window.ProcessMaker !== 'undefined' && 
        window.ProcessMaker.user && 
        window.ProcessMaker.user.datetime_format
      ) {
        config = window.ProcessMaker.user.datetime_format;
      }
      if (value) {
        if (window.moment(value).isValid()) {
          return window.moment(value).format(config);
        }
        return value;
      }
      return 'n/a';
    },
  },
};
</script>
<style scoped>
.message {
  color: #5f666d;
  font-style: italic;
  line-height: 27px;
  word-wrap: break-word;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  border: 0 none;
  z-index: 1;
  font-size: 110%;
  font-weight: 100;
  height: calc(100% - 130px);
}

.hyphen {
  transform: rotate(0deg);
  transform-origin: 0 0;
  border: 1px #5f666d solid;
  width: 30px;
  margin: 5px 13px 0px 13px;
}
.new-process-btn {
  color: #0872c2;
  border-color: #0872c2;
  background-color: #ffffff;
  box-shadow: 0 3px 9px -3px #c2c2c2;
  border-radius: 13px;
}

.new-process-btn:hover {
  background-color: #edf7ff;
  color: #0872C2;
  border-color: #0872C2;
}

.ai-icon {
  width: 22px;
  height: 22px;
}
</style>
