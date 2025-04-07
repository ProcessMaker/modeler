<script>
import baseStartEvent from '@/components/nodes/baseStartEvent/baseStartEvent';
import webEntryIcon from '!!svg-inline-loader!@/assets/webentry.svg';
import emailStartIcon from '!!svg-inline-loader!@/assets/start-event-mail.svg';
import coloredIcon from '@/components/iconColors';

function isWebEntryEnabled(config) {
  if (!config) {
    return false;
  }

  const parsedConfig = JSON.parse(config);

  return parsedConfig && parsedConfig.web_entry && parsedConfig.web_entry.mode !== 'DISABLED';
}

function isEmailStartEnabled(config) {
  if (!config) {
    return false;
  }

  const parsedConfig = JSON.parse(config);

  return parsedConfig && parsedConfig.email_start && parsedConfig.email_start?.enabled;
}

export default {
  extends: baseStartEvent,
  watch: {
    'node.definition.config': {
      immediate: true,
      handler(config) {
        if (isWebEntryEnabled(config)) {
          this.nodeIcon = webEntryIcon;
          this.shape.attr('image/xlink:href', coloredIcon(webEntryIcon, this.node));
          return;
        }

        if (isEmailStartEnabled(config)) {
          this.nodeIcon = emailStartIcon;
          this.shape.attr('image/xlink:href', coloredIcon(emailStartIcon, this.node));
          return;
        }

        this.nodeIcon = null;
        this.shape.attr('image/xlink:href', '');
      },
    },
  },
};
</script>
  