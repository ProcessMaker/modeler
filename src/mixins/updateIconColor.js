import coloredIcon from '@/components/iconColors';

export default {
  data() {
    return {
      nodeIcon: null,
    };
  },
  computed: {
    icon: {
      cache: false,
      get() {
        if (this.node.definition.get('customIcon')) {
          const customIcon = this.node.definition.get('customIcon');
          return atob(customIcon);
        }
        return this.nodeIcon;
      },
    },
  },
  watch: {
    'node.definition.color': {
      handler() {
        this.updateIconColor();
      },
      deep: true,
    },
    'node.definition.customIcon': {
      handler() {
        this.updateIconColor();
      },
      deep: true,
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
