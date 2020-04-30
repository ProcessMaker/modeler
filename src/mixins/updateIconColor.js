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
      if (!this.nodeIcon || this.node.definition.$type === 'bpmn:ServiceTask') {
        return;
      }

      this.shape.attr('image/xlink:href', coloredIcon(this.nodeIcon, this.node));
    },
  },
  mounted() {
    this.setIconColor();
  },
};
