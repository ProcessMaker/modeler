<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import exclusiveGatewaySymbol from '@/assets/exclusive-gateway-symbol.svg';

export default {
  extends: GatewayComponent,
  mounted() {
    this.shape.attr('image/xlink:href', exclusiveGatewaySymbol);
  },
};
</script>
