<template>
  <span data-v-5d8c3587="" class="b-avatar rounded-circle" :style="{backgroundColor: getRandomColor()}">
    <span v-if="imgSrc" class="b-avatar-img">
      <img :src="imgSrc" :alt=initials>
    </span>
    <span v-else class="b-avatar-text avatar-initials"><span>{{ this.getInitials(initials) }}</span></span>
    <span class="b-avatar-badge badge-danger" :style="{bottom: '0px', right: '0px', backgroundColor: badgeBackgroundColor}" />
  </span>
</template>
  
<script>
import { avatarColors } from './uiconstants';
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
    initials: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      colors: avatarColors,
    };
  },
  methods: {
    getInitials(data) {
      if (data != null) {
        let chr;
        const d = data.toUpperCase();
        chr = d.split(' ');
        if (chr.length >= 2) {
          return chr[0][0] + chr[1][0];
        } else {
          return d[0] + d[1];
        }
      }
      return '';
    },
    getRandomColor() {
      let randomIndex = Math.floor(Math.random() * this.colors.length);
      return this.colors[randomIndex];
    },
  },
};

</script>
<style scoped lang="scss" src="./avatar.scss"></style>