<template>
  <b-avatar-group class="container">
    <template v-for="(item,  index) in players" >
      <Avatar :badgeBackgroundColor="item.color" :imgSrc= "item.imgSrc" :initials="item.name" v-bind:key="index"/>
    </template>
  </b-avatar-group> 
</template>
  
<script>
import Avatar from '@/components/topRail/avatar/Avatar';
export default {
  components:{
    Avatar,
  },
  data() {
    return {
      players: [
        { id: '1',
          name: 'Juan Perez',
          color: 'blue',
          imgSrc: 'https://placekitten.com/300/300',
        },
        { id: '2',
          name: 'Ricardo Ford',
          color: '#E4923A',
        },
        { id: '3',
          name: 'Mauri Clear',
          color: '#E4923A',
        },
        { id: '4',
          name: 'Teresa Mamani',
          color: 'yellow',
          imgSrc: 'https://xsgames.co/randomusers/avatar.php?g=female',
        },
      ],
      isOpenPanel: false,
    };
  },
 
};
</script>