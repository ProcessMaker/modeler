<template>
  <div>
  </div>
</template>

<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import inclusiveGatewaySymbol from '@/assets/inclusive-gatway-symbol.svg';

export default {
  extends: GatewayComponent,
  mounted() {
    this.shape.attr('image/xlink:href', inclusiveGatewaySymbol);
  },
};
</script>
