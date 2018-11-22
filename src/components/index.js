// Our main modeler component
import Vue from 'vue';
import Modeler from './Modeler';

// Our StatusBar component, if desired
import StatusBar from './statusbar';

import {
  association,
  endEvent,
  exclusiveGateway,
  inclusiveGateway,
  parallelGateway,
  sequenceFlow,
  startEvent,
  task,
  textAnnotation,
} from './nodes/index';

window.VueFromCommon = Vue;

export {
  Modeler,
  StatusBar,
  association,
  endEvent,
  exclusiveGateway,
  inclusiveGateway,
  parallelGateway,
  sequenceFlow,
  startEvent,
  task,
  textAnnotation,
};
