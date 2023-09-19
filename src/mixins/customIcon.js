import coloredIcon from '@/components/iconColors';

export default {
  data() {
    return {
      iconName: '',
    };
  },
  watch: {
    shape() {
      if (this.node.definition.get('customIcon')) {
        this.setCustomIcon(this.node.definition.get('customIcon'));
      }
    }
  },

  methods: {
    setCustomIconName(iconName) {
      this.iconName = iconName;
    },
    resetCustomIconName() {
      this.setCustomIconName('');
    },
    setCustomIcon(icon) {
      if (!this.shape) {
        return;
      }
    
      try {
        const decodedIcon = atob(icon);
        this.updateIcon(decodedIcon);
      } catch (error) {
        this.updateIcon(icon);
      }
    },
    updateIcon(icon) {
      const iconURL = this.getIconURL(icon);
      this.shape.attr('image/xlink:href', iconURL);
    },
    getIconURL(icon) {
      return coloredIcon(icon, this.node);
    }
  },
  mounted() {
    if (this.node.definition.get('customIcon')) {
      this.setCustomIcon(this.node.definition.get('customIcon'));
    }
  },
};
