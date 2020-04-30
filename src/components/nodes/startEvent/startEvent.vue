<script>
import baseStartEvent from '@/components/nodes/baseStartEvent/baseStartEvent';
import webEntryIcon from '!!svg-inline-loader!@/assets/webentry.svg';
import coloredIcon from '@/components/iconColors';

function isWebEntryEnabled(config) {
  if (!config) {
    return false;
  }

  const parsedConfig = JSON.parse(config);

  return parsedConfig && parsedConfig.web_entry && parsedConfig.web_entry.mode !== 'DISABLED';
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

        this.nodeIcon = null;
        this.shape.attr('image/xlink:href', null);
      },
    },
  },
};
</script>
