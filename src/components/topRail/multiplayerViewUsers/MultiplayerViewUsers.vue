<template>
  <b-avatar-group class="container" v-if="!isMultiplayer">
    <template v-for="item in filteredPlayers" >
      <Avatar :badgeBackgroundColor="item.color" :imgSrc="item.avatar" :userName="item.name" :key="item.key"/>
    </template>
  </b-avatar-group> 
</template>
  
<script>
import { uniqBy } from 'lodash';
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
    filteredPlayers() {
      const allPlayers = uniqBy(this.players, 'name');
      return allPlayers.filter(player => {
        return player.name.toLowerCase() !== window.ProcessMaker.user?.fullName.toLowerCase();
      });
    },
    isMultiplayer: () => store.getters.isMultiplayer,
  },
};
</script>