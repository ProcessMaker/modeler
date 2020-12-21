import coloredIcon from '@/components/iconColors';

export default {
  data() {
    return {
      iconName: '',
    };
  },

  methods: {
    setCustomIconName(iconName) {
      this.iconName = iconName;
    },
    resetCustomIconName() {
      this.setCustomIconName('');
    },
    setCustomIcon(base64Icon) {
      if (!this.shape){
        return;
      }
      this.shape.attr('image/xlink:href', coloredIcon(atob(base64Icon), this.node));
    },
  },
  mounted() {
    if (this.node.definition.get('customIcon')) {
      this.setCustomIcon(this.node.definition.get('customIcon'));
    }
  },
};
