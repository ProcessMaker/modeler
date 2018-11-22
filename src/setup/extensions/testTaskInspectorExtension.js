import {
  task,
} from '@/components/nodes';

window.ProcessMaker.EventBus.$on('modeler-init', modeler => {

  /* Add custom properties to inspector */
  modeler.registerInspectorExtension(task, {
    id: 'pm-due-in',
    component: 'FormInput',
    config: {
      type: 'number',
      label: 'Due In',
      placeholder: '72 hours',
      helper: 'Time when the task will due (hours)',
      name: 'dueIn',
    },
  });
});
