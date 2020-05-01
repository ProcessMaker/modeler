import coloredIcon from '@/components/iconColors';

export default {
  data() {
    return {
      nodeIcon: null,
    };
  },
  watch: {
    'node.definition.color': {
      handler() {
        this.setIconColor();
      },
      deep: true,
    },
  },
  methods: {
    setIconColor() {
      /* Temporary fix to prevent connector icons from switching to the user task icon.
      *  Leaves connector icon the original color. */
      if (!this.nodeIcon || this.node.isBpmnType('bpmn:ServiceTask')) {
        return;
      }

      this.shape.attr('image/xlink:href', coloredIcon(this.nodeIcon, this.node));
    },
  },
  mounted() {
    this.setIconColor();
  },
};
