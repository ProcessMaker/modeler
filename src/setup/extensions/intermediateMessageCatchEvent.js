import {
  intermediateMessageCatchEvent,
} from '@/components/nodes';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerInspectorExtension }) => {

  registerInspectorExtension(intermediateMessageCatchEvent, {
    id: 'pm-allowed-users',
    component: 'FormSelect',
    config: {
      label: 'Allowed Users',
      helper: 'Select allowed users',
      name: 'pm:allowedUsers',
      options: [
        {},
        { value: '1,10', content: '1,10' },
      ],
    },
  });

  registerInspectorExtension(intermediateMessageCatchEvent, {
    id: 'pm-allowed-groups',
    component: 'FormSelect',
    config: {
      label: 'Allowed Groups',
      helper: 'Select allowed groups',
      name: 'pm:allowedGroups',
      options: [
        {},
        { value: '20,30', content: '20,30' },
      ],
    },
  });

  registerInspectorExtension(intermediateMessageCatchEvent, {
    id: 'pm-whitelist',
    component: 'FormInput',
    config: {
      label: 'Whitelist',
      helper: 'IP/Domain whitelist',
      name: 'pm:whitelist',
    },
  });
});
