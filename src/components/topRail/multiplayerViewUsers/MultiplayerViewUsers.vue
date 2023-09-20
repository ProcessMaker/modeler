<template>
  <b-avatar-group class="container">
    <template v-for="item in players" >
      <Avatar :badgeBackgroundColor="item.color" :imgSrc= "item.imgSrc" :userName="item.name" :key="item.key"/>
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
      required: true,
    },
  },
};
</script>