<template>
  <span 
    class="b-avatar rounded-circle"
    :style="{'backgroundColor': generateColorHsl(userName, saturationRange, lightnessRange)}"
  >
    <span v-if="imgSrc" class="b-avatar-img" :id="id">
      <img :src="imgSrc" :alt="userName">
    </span>
    <span v-else class="b-avatar-text avatar-initials" :id="id">
      <span>
        {{ this.getInitials(userName) }}
      </span>
    </span>
    <b-tooltip :target="id" triggers="hover">
      {{ userName }}
    </b-tooltip>
    <span v-if="badgeBackgroundColor" class="b-avatar-badge badge-danger"
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
    id: {
      type: String,
      required: true,
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
    /**
     * Get the initials from a given name.
     *
     * @param {string} name - The full name from which to extract initials.
     * @returns {string} The initials of the first and last names.
     */
    getInitials(name = '') {
      const nameArray = name.split(' ');
      const firstNameIn = nameArray[0].charAt(0).toUpperCase();
      const lastNameIn = nameArray[nameArray.length - 1].charAt(0).toUpperCase();
      return `${firstNameIn}${lastNameIn}`;
    },
    /**
     * Calculates a hash value for a given string.
     *
     * @param {string} str - The input string for which the hash needs to be calculated.
     * @returns {number} The calculated hash value for the input string.
     */
    getHashOfString(str){
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      hash = Math.abs(hash);
      return hash;
    },
    /**
     * Calculates a range around a given value.
     *
     * @param {number} value - The central value.
     * @param {number} range - The range value.
     * @returns {number[]} An array containing the lower and upper bounds of the range.
     */
    getRange(value, range)  {
      return [Math.max(0, value-range), Math.min(value + range, 100)];
    },
    /**
     * Get the hash number to within our range
     * 
     * @param {Number} hash 
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    normalizeHash(hash, min, max){
      return Math.floor((hash % (max - min)) + min);
    },
    /**
     *Generate Unique Color, create a string using our h,s,l values.
     * @param {String} name
     * @param {Array} saturationRange 
     * @param {Array} lightnessRange
     * @returns {Number}
     */
    generateHSL(name, saturationRange, lightnessRange) {
      const hash = this.getHashOfString(name);
      const h = this.normalizeHash(hash, 0, 360);
      const s = this.normalizeHash(hash, saturationRange[0], saturationRange[1]);
      const l = this.normalizeHash(hash, lightnessRange[0], lightnessRange[1]);
      return [h, s, l];
    },
    /**
     * Convert HSL array to string
     * @param {Array} hsl
     * @returns {String}
     */
    HSLtoString(hsl)  {
      return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
    },
    /**
     * Generate a unique hsl value.
     * @param {String} name
     * @param {Array} saturationRange 
     * @param {Array} lightnessRange
     * @returns {String}
     */
    generateColorHsl(id, saturationRange, lightnessRange) {
      return this.HSLtoString(this.generateHSL(id, saturationRange, lightnessRange));
    },
  },
};

</script>
<style scoped lang="scss" src="./avatar.scss"></style>