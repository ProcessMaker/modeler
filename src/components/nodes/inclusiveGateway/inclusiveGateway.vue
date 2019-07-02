<template>
  <div/>
</template>

<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import inclusiveGatewaySymbol from '@/assets/inclusive-gatway-symbol.svg';
import { gatewayDirection } from '@/components/nodes/gateway/gatewayConfig';

export default {
  extends: GatewayComponent,
  data() {
    return {
      outgoing: this.node.definition.get('outgoing'),
      incoming: this.node.definition.get('incoming'),
    };
  },
  watch: {
    incoming(incoming) {
      const incomingCount = incoming.length;

      if (incomingCount <= 1 ) {
        this.node.definition.set('gatewayDirection', gatewayDirection.diverging);
      } else {
        this.node.definition.set('gatewayDirection', gatewayDirection.converging);
      }
    },
  },
  mounted() {
    this.shape.attr('image/xlink:href', inclusiveGatewaySymbol);
  },
};
</script>
