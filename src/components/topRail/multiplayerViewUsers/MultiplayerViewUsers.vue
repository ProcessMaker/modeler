<template>
  <b-avatar-group class="container" v-show="isMultiplayer">
    <template v-for="item in players" >
      <Avatar
        :badgeBackgroundColor="item.color"
        :imgSrc="item.avatar"
        :userName="item.name"
        :id="item.id"
        :key="item.id"
      />
    </template>
  </b-avatar-group> 
</template>
  
<script>
import Avatar from '@/components/topRail/multiplayerViewUsers/avatar/Avatar';
import store from '@/store';

export default {
  components:{
    Avatar,
  },
  props: {
    players: {
      type: Array,
      required: true,
    },
  },
  computed: {
    isMultiplayer: () => store.getters.isMultiplayer,
  },
};
</script>