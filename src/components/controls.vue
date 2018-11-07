<template>
  <div class="controls">
    <div v-for="(items, category) in controls" :key="category">
      <h2>{{category}}</h2>
      <drag v-for="(control, index) in items" :key="index" :transfer-data="{type: control.type}">
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
import { Drag, Drop } from 'vue-drag-drop';

export default {
  props: ['controls'],
  components: {
    Drag,
    Drop,
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
        font-size: 0.75em;
        font-weight: bold;
        padding-bottom: 8px;
        padding-top: 8px;
    }

    .tool {
        display: flex;
        align-items: center;
        font-size: 0.75em;
        padding: 4px;
        font-weight: bold;
        color: #333333;

        &:hover {
            background-color: #3397e1;
            cursor: pointer;
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
