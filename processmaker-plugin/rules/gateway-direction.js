const { isAny } = require('bpmnlint-utils');

/**
 * Rule that validates gateways according to the following rules:
 *
 *  - A Gateway with a gatewayDirection of converging MUST have multiple incoming Sequence
 *    Flows, but MUST NOT have multiple outgoing Sequence Flows.
 *
 *  - A Gateway with a gatewayDirection of diverging MUST have multiple outgoing Sequence
 *    Flows, but MUST NOT have multiple incoming Sequence Flows.
 */
module.exports = function() {
  let gateway = null;

  function isDiverging() {
    return gateway.gatewayDirection === 'diverging';
  }

  function isConverging() {
    return gateway.gatewayDirection === 'converging';
  }

  function hasMultipleIncomingFlows() {
    return gateway.get('incoming').length > 1;
  }

  function hasMultipleOutgoingFlows() {
    return gateway.get('outgoing').length > 1;
  }

  function check(node, reporter) {
    if (!isAny(node, ['bpmn:InclusiveGateway', 'bpmn:ParallelGateway'])) {
      return;
    }

    gateway = node;

    if (isConverging()) {
      if (!hasMultipleIncomingFlows()) {
        reporter.report(gateway.id, 'Gateway must have multiple incoming Sequence Flows');
      }

      if (hasMultipleOutgoingFlows()) {
        reporter.report(gateway.id, 'Gateway must not multiple outgoing Sequence Flows');
      }
    }

    if (isDiverging()) {
      if (!hasMultipleOutgoingFlows()) {
        reporter.report(gateway.id, 'Gateway must have multiple outgoing Sequence Flows');
      }

      if (hasMultipleIncomingFlows()) {
        reporter.report(gateway.id, 'Gateway must not have multiple incoming Sequence Flows');
      }
    }
  }

  return { check };
};
