<template>
  <div class="controls">
    <div v-for="(items, category) in controls" :key="category">
      <h2>{{category}}</h2>

      <drag
        v-for="(control, index) in items"
        :key="index"
        :transfer-data="{
          component: control.component,
          type: control.type,
          definition: control.definition,
          diagram: control.diagram,
        }"
      >
        <div class="tool">
          <div class="img-container">
            <img :src="control.icon">
          </div>
          <div>{{control.label}}</div>
        </div>
      </drag>
    </div>
  </div>
</template>

<script>
import { Drag } from 'vue-drag-drop';
import controls from '../controls';

export default {
  components: {
    Drag,
  },
  data() {
    return {
      controls,
    };
  },
};
</script>

<style lang="scss" scoped>
.controls {
  background-color: #eeeeee;
  border-right: 1px solid #aaaaaa;
  width: 320px;
  text-align: left;
  overflow-y: auto;
  overflow-x: auto;

  h2 {
      font-size: 1.1em;
      background-color: #aaaaaa;
      border-top: 1px solid #999999;
      border-bottom: 1px solid #999999;
      padding-left: 8px;
      margin-bottom: 0px;
      font-size: .75em;
      font-weight: bold;
      padding-bottom: 8px;
      padding-top: 8px;
  }

  .tool {
      display: flex;
      align-items: center;
      font-size: .75em;
      padding: 4px;
      font-weight: bold;
      color: #333333;
      cursor: pointer;

      &:hover {
          background-color: #3397e1;
          color: white;
      }

      .img-container {
          margin-right: 8px;
          width: 32px;
          text-align: center;
      }
  }
}
</style>
