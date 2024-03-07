<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import exclusiveGatewaySymbol from '@/assets/exclusive-gateway-symbol.svg?raw';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: GatewayComponent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: exclusiveGatewaySymbol,
    };
  },
};
</script>
