/* 1366x768 is the most common desktop screen resolution according to the following sources:
 * https://www.w3schools.com/browsers/browsers_display.asp
 * http://gs.statcounter.com/screen-resolution-stats/desktop/worldwide
 */
export const defaultViewportDimensions = {
  width: 1366,
  height: 768,
};

export const nodeTypes = [
  'processmaker-modeler-task',
  'processmaker-modeler-end-event',
  'processmaker-modeler-script-task',
  'processmaker-modeler-exclusive-gateway',
  'processmaker-modeler-parallel-gateway',
  'processmaker-modeler-text-annotation',
  'processmaker-modeler-pool',
];
