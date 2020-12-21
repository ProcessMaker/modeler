import coloredIcon from '@/components/iconColors';

export default {
  data() {
    return {
      nodeIcon: null,
    };
  },
  computed: {
    icon() {
      if (this.node.definition.customIcon) {
        return atob(this.node.definition.customIcon);
      }
      return this.nodeIcon;
    },
  },
  watch: {
    'node.definition.color': {
      handler() {
        this.updateIconColor();
      },
    },
    'node.definition.customIcon': {
      handler() {
        this.updateIconColor();
      },
    },
  },
  methods: {
    updateIconColor() {
      /* Temporary fix to prevent connector icons from switching to the user task icon.
      *  Leaves connector icon the original color. */
      if (!this.nodeIcon || this.node.isBpmnType('bpmn:ServiceTask')) {
        return;
      }

      if (!this.shape) {
        return;
      }
      this.shape.attr('image/xlink:href', coloredIcon(this.icon, this.node));
    },
  },
  mounted() {
    this.updateIconColor();
  },
};
