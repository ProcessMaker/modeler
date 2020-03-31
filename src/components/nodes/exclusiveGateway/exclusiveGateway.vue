<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import exclusiveGatewaySymbol from '!!svg-inline-loader!@/assets/exclusive-gateway-symbol.svg';
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
