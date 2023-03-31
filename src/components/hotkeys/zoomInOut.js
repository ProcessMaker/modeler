export default {
  methods: {
    zoomInOutHandler(event, options) {
      const isPlus = 
        (event.key === '+' || event.key === 'NumpadAdd')
        || (event.keyCode === 107 || event.keyCode === 187);

      const isMinus = 
        (event.key === '-' || event.key === 'NumpadSubtract')
        || (event.keyCode === 109 || event.keyCode === 189);


      if (isPlus && options.mod) {
        this.zoomIn(event);
      }
      if (isMinus && options.mod) {
        this.zoomOut(event);
      }
    },
    zoomIn(event) {
      event.preventDefault();
      this.canvasScale = this.paperManager.scale.sx + this.scaleStep;
    },
    zoomOut(event) {
      event.preventDefault();
      this.canvasScale = Math.max(this.minimumScale, this.paperManager.scale.sx -= this.scaleStep);
    },
  },
};