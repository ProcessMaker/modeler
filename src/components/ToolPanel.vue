<template>
    <div class="tool-panel" ref="panel">
        <div class="header" @mousedown="startDrag"></div>
        <drag :transfer-data="{type: 'Task'}">
        <div class="tool">
            <img src="../assets/toolpanel/task.svg">
        </div>
        </drag>
        <div class="tool">
            <img src="../assets/toolpanel/exclusive-gateway.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/parallel-gateway.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/inclusive-gateway.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/start-event.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/intermediate-mail-event.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/intermediate-time-event.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/end-event.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/end-email-event.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/pool.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/lane.svg">
        </div>
        <div class="tool">
            <img src="../assets/toolpanel/text-annotation.svg">
        </div>
    </div>
</template>

<script>


export default {
  data() {
    return {
      dragging: false,
      dragX: null,
      dragY: null
    };
  },
  methods: {
    startDrag(event) {
      this.dragging = true;
      this.dragX = event.clientX;
      this.dragY = event.clientY;
      document.addEventListener("mousemove", this.drag);
      document.addEventListener("mouseup", this.endDrag);
    },
    endDrag() {
      this.dragging = false;
      this.dragX = null;
      this.dragY = null;
      document.removeEventListener("mousemove", this.drag);
      document.removeEventListener("mouseup", this.endDrag);
    },
    drag(event) {
      if (this.dragging) {
        let panel = this.$refs.panel;
        panel.style.top = panel.offsetTop - (this.dragY - event.clientY) + "px";
        panel.style.left =
          panel.offsetLeft - (this.dragX - event.clientX) + "px";
        this.dragX = event.clientX;
        this.dragY = event.clientY;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tool-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  background: lightgrey;
  border-radius: 2px;
  border: 1px solid #888888;
  z-index: 50;
  width: 42px;
  display: flex;
  flex-direction: column;
  user-select: none;

  .header {
    height: 16px;
    min-height: 16px;
    background-color: darkgrey;
    border-bottom: 1px solid #888888;
  }

  .tool {
    margin: 4px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid lightgrey;
    &:hover {
      background-color: #bbbbbb;
      border: 1px solid #888888;
      border-radius: 2px;
    }
  }
}
</style>


