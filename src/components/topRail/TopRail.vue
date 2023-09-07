<template>
  <div class="top-rail-container">
    <MultiplayerViewUsers :players="players"/>
    <ValidateIssue
      v-show="isOpenIssue"
      :number-of-errors="numberOfErrors"
      @openPanel="handleOpenPanel"
    />

    <ValidateButton @openIssue="handleOpenIssue" />

    <ValidatePanel
      v-show="isOpenIssue && isOpenPanel"
      :error-list="errorList"
      :warnings="warnings"
    />
    <slot />
  </div>
</template>

<script>
import store from '@/store';
import { ValidateButton, ValidateIssue, ValidatePanel } from '@/components/topRail/validateControl';
import MultiplayerViewUsers from '@/components/topRail/multiplayerViewUsers/MultiplayerViewUsers';
export default {
  components: {
    ValidateButton,
    ValidateIssue,
    ValidatePanel,
    MultiplayerViewUsers,
  },
  props: {
    validationErrors: {
      type: Object,
      required: true,
    },
    warnings: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isOpenIssue: false,
      isOpenPanel: false,
      players: [],
    };
  },
  computed: {
    errorList() {
      // Get a formatted error list to show in the issue panel
      return Object.entries(this.validationErrors)
        .flatMap(([errorKey, errors]) => (
          errors.flatMap(error => ({
            ...error,
            errorKey,
            ...{ 'errorId': `${error.id}_${error.message.split(' ').join('_')}` },
          }))
        ));
    },
    numberOfErrors() {
      // Get the number of errors
      return this.errorList.length + this.warnings.length;
    },
  },
  watch: {
    numberOfErrors(newValue) {
      // Checks the number of errors, if it is "0" hides the panel errors
      if (newValue === 0) {
        this.isOpenPanel = false;
      }
    },
  },
  mounted() {
    if (process.env.NODE_ENV !== 'production') {
      this.players = [
        { id: '1',
          name: 'Juan Perez',
          color: 'blue',
          imgSrc: 'https://placekitten.com/300/300',
        },
        { id: '2',
          name: 'Ricardo Ford',
          color: '#E4923A',
        },
        { id: '3',
          name: 'Mauri Clear',
          color: '#E4923A',
        },
        { id: '4',
          name: 'Tisha Mccullough',
          color: 'yellow',
          imgSrc: 'https://xsgames.co/randomusers/avatar.php?g=female',
        },
      ];
    }
    
  },
  methods: {
    /**
     * Show/hide the issue button
     * @param {boolean} value
     */
    handleOpenIssue(value) {
      this.isOpenIssue = value;
      // Set the auto-validate value store
      store.commit('setAutoValidate', this.isOpenIssue);
    },
    /**
     * Show/hide the issue panel
     * @param {boolean} value
     */
    handleOpenPanel(value) {
      this.isOpenPanel = value;
    },
  },
};
</script>

<style scoped lang="scss" src="./topRail.scss"></style>
