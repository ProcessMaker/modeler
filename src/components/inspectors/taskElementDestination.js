import ElementDestination from '@/components/inspectors/ElementDestination.vue';
// import NodeInspector from '@/NodeInspector';
// import omit from 'lodash/omit';

export const elementDestinationHandler = function(value, node, setNodeProp, moddle, definitions, isMultiplayer) {
 
};

export const elementDestinationData = function(inspectorData, node, defaultDataTransform, { definitions }) {
 
};

export default {
  component: ElementDestination,
  config: {
    label: 'Element Destination',
    helper: 'Select the element destination',
    placeholder: 'Select the element destination',
    name: 'elementDestinationType',
    destinationType: 'taskSource',
    options: [
      { value: 'taskSource', content: 'Task Source (Default)' },
      { value: 'taskList', content: 'Task List' },
      { value: 'processLaunchpad', content: 'Process Launchpad' },
      { value: 'homepageDashboard', content: 'Homepage Dashboard' },
      { value: 'customDashboard', content: 'Dashboard' },
      { value: 'externalURL', content: 'External URL' },
    ],
  },
};
