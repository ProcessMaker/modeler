<template>
  <div>
    <ul class="control-list">

      <li v-for="(item, key) in controlList" class="control-item" :id="item.id" :key="key">
        <!-- <div class="control-item-options">
          <span />
        </div>
        <img :src=item.iconSrc :alt=item.label> -->

        <popper
          trigger="clickToOpen"
          :options="{
            placement: 'top',
            modifiers: { offset: { offset: '0,10px' } }
          }"
          :visible-arrow=false
        >
          <div class="popper">
            Popper Content {{ item.label }}
          </div>

          <!-- <button slot="reference"> -->
          <!-- Reference Element -->
          <div variant="light" slot="reference">
            <div class="control-item-options">
              <span />
              
            </div>
            <img :src=item.iconSrc :alt=item.label>
        
          </div>
            
          <!-- </button> -->
        </popper>
       
      </li>

      <li class="control-item">
        <div class="control-add">
          <img :src="plusIcon" :alt="$t('Add')">
        </div>
      </li>


    </ul>
    
    

  </div>

</template>

<script>
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
export default ({
  components: {
    Popper,
  },
  data() {
    return {
      controlList:[
        {
          iconSrc: '/img/start-event.e895cee2.svg',
          label: this.$t('Start Event'),
          id: 'startEvent',
        },
        {
          iconSrc: '/img/generic-intermediate-event.ba2e1d71.svg',
          label: this.$t('Intermediate Event'),
          id: 'intermediateEvent',
        },
        {
          iconSrc: '/img/end-event.1ad31396.svg',
          label: this.$t('End Event'),
          id: 'endEvent',
        },
        {
          iconSrc: '/img/task.e7419065.svg',
          label: this.$t('Task'),
          id: 'task',
        },
        {
          iconSrc: '/img/generic-gateway.3a76fc75.svg',
          label: this.$t('Gateway'),
          id: 'gateway',
        },
        {
          iconSrc: '/img/pool.ac62ddae.svg',
          label: this.$t('Pool'),
          id: 'pool',
        },
      ],
      plusIcon: require('@/assets/railBottom/plus-lg-light.svg'),
    };
  },
});

</script>

<style lang="scss" scoped src="./controls.scss"></style>
