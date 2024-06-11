<template>
  <div class="doc-container" v-show="isVisible" :style="{top: position.y + 'px', left: position.x + 'px' }">
    <div class="side-bar">
      <div class="icon">{{ number }}</div>
    </div>
    <div class="content">
      <div class="element-type">{{ elementType }}</div>
      <div class="element-title">{{ elementTitle }}</div>
      <div class="element-description" v-html="text"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NodeDocumentation',
  data() {
    return {
      isVisible: false,
      text: 'pp',
      number: 22,
      elementType: 'Start Event',
      elementTitle: 'Inicio del Proceso',
      position: {
        x: 0,
        y: 0,
      },
    };
  },
  methods: {
  },
};
</script>



<style scoped>
.doc-container {
  position: absolute;
  left: 100px;
  top: 100px;
  width: 560px;
  display: flex;
  align-items: stretch;
  min-height: 100px;
  border-radius: 10px;
  border: 2px solid #eaeaea;
}

.side-bar {
  background: #CDDDEE;
  float: left;
  width: 50px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  gap: 10px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  border-radius: 10px 0 0 10px;
}


.icon {
  background: #1572C2;
  color: white;
  font-family: 'Open Sans', sans-serif;
  font-size: 20px;
  font-weight: 700;
  width: 35px;
  height: 35px;
  border-radius: 00%;
  align-items: center;
  text-align: center;
  vertical-align: middle;
  border-radius: 100%;
  padding-top: 2px;
}

.content {
  padding: 8px;
  background: white;
  border-radius: 0 10px 10px 0;
}

.element-type {
  height: 30px;
  width: 180px;
  text-align: left;
  font-family: 'Open Sans', serif;
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.02em;
  color: #556271;
  padding: 4px 7px;
  gap: 8px;
  background: #EBEFF4;
  border-radius: 4px;
}

.element-title {
  height: 36px;
  padding: 5px 0 0 5px;
  font-family: 'Open Sans', serif;
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 25px;
  letter-spacing: -0.02em;
  color: #556271;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

.element-description {
  font-family: 'Open Sans', serif;
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  letter-spacing: -0.02em;
  padding: 5px 0 0 5px;
  color: #556271;
  width: 487px;
}

</style>
