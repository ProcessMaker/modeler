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
      incoming: this.node.definition.get('incoming'),
      nodeIcon: inclusiveGatewaySymbol,
    };
  },
  watch: {
    incoming(incoming) {
      const direction = incoming.length <= 1
        ? gatewayDirection.diverging
        : gatewayDirection.converging;

      this.node.definition.set('gatewayDirection', direction);
    },
  },
};
</script>
