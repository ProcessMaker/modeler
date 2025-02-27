import ElementDestination from '@/components/inspectors/ElementDestination.vue';

export default {
  component: ElementDestination,
  config: {
    label: 'Element Destination',
    name: 'elementDestination',
    destinationType: 'taskSource',
    options: [
      { value: 'summaryScreen', content: 'Summary Screen (Default)' },
      { value: 'taskList', content: 'Task List' },
      { value: 'processLaunchpad', content: 'Process Launchpad' },
      { value: 'homepageDashboard', content: 'Welcome Screen' },
      { value: 'customDashboard', content: 'Custom Dashboard' },
      { value: 'externalURL', content: 'External URL' },
      { value: 'anotherProcess', content: 'Another Process' },
    ],
  },
};
