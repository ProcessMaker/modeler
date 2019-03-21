/**
 * Rule that delegates to custom validation functions registered during runtime
 */
module.exports = function() {
  function check(node, reporter) {
    window.ProcessMaker.EventBus.$emit('modeler-validate', node, reporter);
  }

  return { check };
};
