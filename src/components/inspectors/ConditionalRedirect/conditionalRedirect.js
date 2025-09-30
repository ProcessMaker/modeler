import ConditionalRedirect from './ConditionalRedirect.vue';

export default {
  component: ConditionalRedirect,
  config: {
    label: 'Conditional Redirects',
    name: 'conditionalRedirect',
    options: [
      { value: 'taskSource', content: 'Task Source' },
      { value: 'taskList', content: 'Task List' },
      { value: 'processLaunchpad', content: 'Process Launchpad' },
      { value: 'homepageDashboard', content: 'Home Page' },
      { value: 'customDashboard', content: 'Custom Dashboard' },
      { value: 'externalURL', content: 'External URL' },
      { value: 'displayNextAssignedTask', content: 'Display Next Assigned Task' },
    ],
  },
};
