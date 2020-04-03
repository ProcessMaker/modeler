<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import inclusiveGatewaySymbol from '!!svg-inline-loader!@/assets/inclusive-gatway-symbol.svg';
import { gatewayDirection } from '@/components/nodes/gateway/gatewayConfig';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: GatewayComponent,
  mixins: [updateIconColor],
  data() {
    return {
      outgoing: this.node.definition.get('outgoing'),
      incoming: this.node.definition.get('incoming'),
      nodeIcon: inclusiveGatewaySymbol,
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
};
</script>
