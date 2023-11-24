
export default class ColorUtil {
  saturationRange = null;
  lightnessRange = null;
  constructor(saturation, lightness, range) {
    this.saturationRange = this.getRange(saturation, range);
    this.lightnessRange =  this.getRange(lightness, range);
  }

  getRange(value, range) {
    return [Math.max(0, value - range), Math.min(value + range, 100)];
  }
  
  /**
   * Calculates a hash value for a given string.
   *
   * @param {string} str - The input string for which the hash needs to be calculated.
   * @returns {number} The calculated hash value for the input string.
   */
  getHashOfString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    return hash;
  }
  /**
   * Get the hash number to within our range
   * 
   * @param {Number} hash
   * @param {Number} min
   * @param {Number} max
   * @returns {Number}
     */
  normalizeHash(hash, min, max) {
    return Math.floor((hash % (max - min)) + min);
  }
  /**
   *Generate Unique Color, create a string using our h,s,l values.
    * @param {String} name
    * @param {Array} saturationRange 
    * @param {Array} lightnessRange
    * @returns {Number}
    */
  generateHSL(name) {
    console.log(name);
    const hash = this.getHashOfString(name);
    const h = this.normalizeHash(hash, 0, 360);
    const s = this.normalizeHash(hash, this.saturationRange[0], this.saturationRange[1]);
    const l = this.normalizeHash(hash, this.lightnessRange[0], this.lightnessRange[1]);
    return [h, s, l];
  }
  /**
   * Convert HSL array to string
   * @param {Array} hsl
   * @returns {String}
   */
  HSLtoString(hsl) {
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
  }
  /**
   * Generate the HSL string color
   * @param {String} id
   * @returns {String}
   */
  generateColorHsl(id) {
    return this.HSLtoString(this.generateHSL(id, this.saturationRange, this.lightnessRange));
  }
  /**
   * Create a random color using the user name string
   * @param {String} userName
   * @returns {String || null}
   */
  randomColor(userName) {
    return userName ? this.generateColorHsl(userName) : null;
  }
}