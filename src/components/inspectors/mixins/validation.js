let Validator = require('validatorjs');

// To include another language in the Validator with variable processmaker
let globalObject = typeof window === 'undefined'
  ? global
  : window;

if (globalObject.ProcessMaker && globalObject.ProcessMaker.user && globalObject.ProcessMaker.user.lang) {
  Validator.useLang(globalObject.ProcessMaker.user.lang);
}

export default {
  props: [
    'validation',
    'validationData',
    'validationField',
    'validationMessages',
  ],
  data() {
    return {
      validator: null,
    };
  },
  mounted() {
    this.updateValidation();
  },
  watch: {
    // Triggered whenever the v-model is updated
    value() {
      this.updateValidation();
    },
    // Triggered whenever the validation rule is updated
    validation() {
      this.updateValidation();
    },
    label() {
      this.updateValidation();
    },
    validationData: {
      handler() {
        this.updateValidation();
      },
      deep: true,
    },
  },
  methods: {
    updateValidation() {
      if (this.validation) {
        let fieldName = this.validationField ? this.validationField : this.name;
        let data = this.validationData ? this.validationData : {[fieldName]: this.value};
        let rules = {
          [fieldName]: this.validation,
        };
        this.validator = new Validator(data, rules, this.validationMessages ? this.validationMessages : null);
        // Validation will not run until you call passes/fails on it
        this.validator.passes();
      } else {
        this.validator = null;
      }

      // Show data type validation messages if exists
      if (this.dataTypeValidator && !this.dataTypeValidatorPasses) {
        if (!this.value) {
          this.validator = null;
          return;
        }
        this.validator = this.dataTypeValidator;
      }
    },
  },
};
