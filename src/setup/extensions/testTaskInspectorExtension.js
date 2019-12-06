import { task } from '@/components/nodes';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerInspectorExtension }) => {

  /* Add custom properties to inspector */
  registerInspectorExtension(task, {
    id: 'pm-due-in',
    component: 'FormInput',
    config: {
      type: 'number',
      label: 'Due In',
      placeholder: '72 hours',
      helper: 'Time when the task will due (hours)',
      name: 'dueIn',
      validation: 'numeric|min:1',
    },
  });

  registerInspectorExtension(task, {
    id: 'pm-assigned-users',
    component: 'FormSelect',
    config: {
      label: 'Users',
      placeholder: 'Select a user',
      helper: 'Assign user to task',
      name: 'assignedUsers',
      options: [
        {},
        { value: 'John Smith', content: 'John Smith' },
        { value: 'Jane Smith', content: 'Jane Smith' },
      ],
    },
  });

  registerInspectorExtension(task, {
    component: 'FormAccordion',
    container: true,
    config: {
      initiallyOpen: false,
      label: 'Assignment Rules',
      icon: 'users',
      name: 'assignmentRules',
    },
    items: [
      {
        component: 'FormInput',
        config: {
          label: 'Task Assignment',
          helper: '',
          name: 'taskAssignment',
        },
      },
    ],
  });
});
