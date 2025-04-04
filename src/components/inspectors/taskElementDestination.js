import ElementDestination from '@/components/inspectors/ElementDestination.vue';

export default {
  component: ElementDestination,
  config: {
    label: 'Task Destination',
    name: 'elementDestination',
    destinationType: 'taskSource',
    options: [
      { value: 'taskSource', content: 'Task Source (Default)' },
      { value: 'taskList', content: 'Task List' },
      { value: 'processLaunchpad', content: 'Process Launchpad' },
      { value: 'homepageDashboard', content: 'Home Page' },
      { value: 'customDashboard', content: 'Custom Dashboard' },
      { value: 'externalURL', content: 'External URL' },
      { value: 'displayNextAssignedTask', content: 'Display Next Assigned Task' },
    ],
  },
};
