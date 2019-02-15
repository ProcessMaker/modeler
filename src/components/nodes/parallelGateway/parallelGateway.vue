<template>
  <div>
  </div>
</template>

<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import parallelGatewaySymbol from '@/assets/parallel-gateway-symbol.svg';

export default {
  extends: GatewayComponent,
  mounted() {
    this.shape.attr('image/xlink:href', parallelGatewaySymbol);
  },
};
</script>
