<template>
  <div class="controls">
      <input placeholder="Filter..." class="form-control form-control-sm" type="text" v-model="filterQuery">
    <div v-for="(items, category) in controls" :key="category">
      <h2>{{category}}</h2>
      <drag
        v-for="(control, index) in items"
        :key="index"
        :transfer-data="{type: control.type}"
        v-if="control.label.toLowerCase().includes(filterQuery.toLowerCase())"
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

export default {
  props: ['controls'],
  components: {
    Drag,
  },
  data() {
    return {
      filterQuery: '',
    };
  },
};
</script>

<style lang="scss" scoped>
.controls {
  background-color: #eee;
  border-right: 1px solid #aaa;
  width: 320px;
  text-align: left;
  overflow-y: auto;
  overflow-x: auto;

  h2 {
    font-size: 1.1em;
    background-color: #aaa;
    border-top: 1px solid #999;
    border-bottom: 1px solid #999;
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
    color: #333;
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
