<template>
  <span 
    class="b-avatar rounded-circle"
    :style="{'backgroundColor': backgroundColor}"
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
      backgroundColor: '#104A75',
    };
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
  },
};

</script>
<style scoped lang="scss" src="./avatar.scss"></style>