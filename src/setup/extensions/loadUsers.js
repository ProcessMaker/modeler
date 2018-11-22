import {
  task,
} from '@/components/nodes';

window.ProcessMaker.EventBus.$on('modeler-start', async () => {
  // const { data: users } = await window.ProcessMaker.apiClient.get('/user');

  /* Add custom properties to inspector */
  task.inspectorConfig[0].items.push({
    component: 'FormInput',
    config: {
      type: 'number',
      label: 'Due In',
      placeholder: '72 hours',
      helper: 'Time when the task will due (hours)',
      name: 'dueIn',
    },
  }, {
    component: 'FormSelect',
    config: {
      label: 'Direction',
      helper: 'The direction of the gateway',
      name: 'gatewayDirection',
      options: [],//users.map(user => ({ value: user.id, content: `${user.firstname} ${user.lastname}` })),
    },
  });
});
