<template>
  <span 
    class="b-avatar rounded-circle"
    :style="{'backgroundColor': generateColorHsl(userName, saturationRange, lightnessRange)}"
  >
    <span v-if="imgSrc" class="b-avatar-img">
      <img :src="imgSrc" :alt=userName>
    </span>
    <span v-else class="b-avatar-text avatar-initials">
      <span>
        {{ this.getInitials(userName) }}
      </span>

    </span>
    <span class="b-avatar-badge badge-danger"
      :style="{bottom: '0px', right: '0px', backgroundColor: badgeBackgroundColor}" 
    />
  </span>
</template>
  
<script>

export default {
  props: {
    badgeBackgroundColor: {
      type: String,
      required: false,
    },
    imgSrc: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      saturation: 50,
      lightness: 50,
      range: 10,
    };
  },
  computed: {
    saturationRange() {
      return this.getRange(this.saturation, this.range);
    },
    lightnessRange() {
      return this.getRange(this.lightness, this.range);
    },
  },
  methods: {
    getInitials(name= '') {
      const nameArray = name.split(' ');
      const firstNameIn = nameArray[0].charAt(0).toUpperCase();
      const lastNameIn = nameArray[nameArray.length - 1].charAt(0).toUpperCase();
      return firstNameIn + lastNameIn;
    },

    getHashOfString(str){
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      hash = Math.abs(hash);
      return hash;
    },
    getRange(value, range)  {
      return [Math.max(0, value-range), Math.min(value+range, 100)];
    },
    normalizeHash(hash, min, max){
      return Math.floor((hash % (max - min)) + min);
    },
    generateHSL(name, saturationRange, lightnessRange) {
      const hash = this.getHashOfString(name);
      const h = this.normalizeHash(hash, 0, 360);
      const s = this.normalizeHash(hash, saturationRange[0], saturationRange[1]);
      const l = this.normalizeHash(hash, lightnessRange[0], lightnessRange[1]);
      return [h, s, l];
    },

    HSLtoString(hsl)  {
      return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
    },

    generateColorHsl(id, saturationRange, lightnessRange) {
      return this.HSLtoString(this.generateHSL(id, saturationRange, lightnessRange));
    },
  },
};

</script>
<style scoped lang="scss" src="./avatar.scss"></style>