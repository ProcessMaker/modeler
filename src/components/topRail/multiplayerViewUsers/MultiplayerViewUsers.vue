<template>
  <b-avatar-group class="container">
    <template v-for="(item, index) in players" >
      <Avatar :badgeBackgroundColor="item.color" :imgSrc= "item.imgSrc" :userName="item.name" v-bind:key="index"/>
    </template>
  </b-avatar-group> 
</template>
  
<script>
import Avatar from '@/components/topRail/multiplayerViewUsers/avatar/Avatar';
export default {
  components:{
    Avatar,
  },
  props: {
    players: {
      type: Array,
      required: [],
    },
  },
};
</script>