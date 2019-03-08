import {
  intermediateMessageCatchEvent,
} from '@/components/nodes';
import webHookFormGroup from '../../components/nodes/intermediateMessageCatchEvent/webHookFormGroup.vue';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerInspectorExtension }) => {

  /* Add custom properties to inspector */
  registerInspectorExtension(intermediateMessageCatchEvent, {
    id: 'pm-web-hook',
    component: webHookFormGroup,
    config: {
      name: 'pm:webHook',
    },
  });

  registerInspectorExtension(intermediateMessageCatchEvent, {
    id: 'pm-condition',
    component: 'FormInput',
    config: {
      label: 'Condition',
      helper: 'Expression to be evaluated on webhook to activate event. Leave blank to accept always.',
      name: 'pm:condition',
    },
  });
});
