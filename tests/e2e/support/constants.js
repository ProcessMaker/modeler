/* 1366x768 is the most common desktop screen resolution according to the following sources:
 * https://www.w3schools.com/browsers/browsers_display.asp
 * http://gs.statcounter.com/screen-resolution-stats/desktop/worldwide
 */
export const defaultViewportDimensions = {
  width: 1366,
  height: 768,
};

/**
 * Node types are strings returned by
 * shape.component.node.type - they are not the string
 * same as the shape type.
 */
export const nodeTypes = {
  dataObject: 'processmaker-modeler-data-object',
  dataStore: 'processmaker-modeler-data-store',
  startEvent: 'processmaker-modeler-start-event',
  messageStartEvent: 'processmaker-modeler-message-start-event',
  task: 'processmaker-modeler-task',
  endEvent: 'processmaker-modeler-end-event',
  messageEndEvent: 'processmaker-modeler-message-end-event',
  scriptTask: 'processmaker-modeler-script-task',
  manualTask: 'processmaker-modeler-manual-task',
  exclusiveGateway: 'processmaker-modeler-exclusive-gateway',
  parallelGateway: 'processmaker-modeler-parallel-gateway',
  inclusiveGateway: 'processmaker-modeler-inclusive-gateway',
  eventBasedGateway: 'processmaker-modeler-event-based-gateway',
  textAnnotation: 'processmaker-modeler-text-annotation',
  pool: 'processmaker-modeler-pool',
  startTimerEvent: 'processmaker-modeler-start-timer-event',
  intermediateCatchEvent: 'processmaker-modeler-intermediate-catch-timer-event',
  intermediateMessageCatchEvent: 'processmaker-modeler-intermediate-message-catch-event',
  intermediateMessageThrowEvent: 'processmaker-modeler-intermediate-message-throw-event',
  subProcess: 'processmaker-modeler-call-activity',
  testConnector: 'connectors-test-message',
  sendTweet: 'processmaker-connectors-social-twitter-send',
  boundaryEvent: 'processmaker-modeler-boundary-event',
  boundaryErrorEvent: 'processmaker-modeler-boundary-error-event',
  boundaryTimerEvent: 'processmaker-modeler-boundary-timer-event',
  boundarySignalEvent: 'processmaker-modeler-boundary-signal-event',
  boundaryConditionalEvent: 'processmaker-modeler-boundary-conditional-event',
  boundaryEscalationEvent: 'processmaker-modeler-boundary-escalation-event',
  taskWithMarker: 'processmaker-custom-marker-task-test',
  boundaryMessageEvent: 'processmaker-modeler-boundary-message-event',
  errorEndEvent: 'processmaker-modeler-error-end-event',
  terminateEndEvent: 'processmaker-modeler-terminate-end-event',
  poolLane: 'processmaker-modeler-lane',
};

/**
 * Shape types are returned by shape.get('type').
 */
export const shapeTypes = {
  poolLane: 'PoolLane',
  boundaryEvent: 'processmaker.components.nodes.boundaryEvent.Shape',
};

export const boundaryEventSelector = '.main-paper ' +
  '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';

export const taskSelector = '.main-paper ' +
  '[data-type="processmaker.components.nodes.task.Shape"]';
