import ElementDestination from '@/components/inspectors/ElementDestination.vue';

export default {
  component: ElementDestination,
  config: {
    label: 'Element Destination',
    helper: 'Select the element destination',
    placeholder: 'Select the element destination',
    name: 'elementDestinationType',
    destinationType: 'taskSource',
    options: [
      { value: 'summaryScreen', content: 'Summary Screen' },
      { value: 'taskList', content: 'Task List' },
      { value: 'processLaunchpad', content: 'Process Launchpad' },
      { value: 'homepageDashboard', content: 'Wellcome Screen' },
      { value: 'customDashboard', content: 'Dashboard' },
      { value: 'externalURL', content: 'External URL' },
    ],
  },
};
