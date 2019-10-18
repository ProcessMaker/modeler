/* 1366x768 is the most common desktop screen resolution according to the following sources:
 * https://www.w3schools.com/browsers/browsers_display.asp
 * http://gs.statcounter.com/screen-resolution-stats/desktop/worldwide
 */
export const defaultViewportDimensions = {
  width: 1366,
  height: 768,
};

export const nodeTypes = {
  startEvent: 'processmaker-modeler-start-event',
  task: 'processmaker-modeler-task',
  endEvent: 'processmaker-modeler-end-event',
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
  callActivity: 'processmaker-modeler-call-activity',
  testConnector: 'connectors-test-message',
  sendTweet: 'processmaker-connectors-social-twitter-send',
  boundaryEvent: 'processmaker-modeler-boundary-event',
  boundaryErrorEvent: 'processmaker-modeler-boundary-error-event',
  boundaryTimerEvent: 'processmaker-modeler-boundary-timer-event',
  boundarySignalEvent: 'processmaker-modeler-boundary-signal-event',
  taskWithMarker: 'processmaker-custom-marker-task-test',
};

export const boundaryEventSelector = '.main-paper ' +
  '[data-type="processmaker.components.nodes.boundaryEvent.Shape"]';
