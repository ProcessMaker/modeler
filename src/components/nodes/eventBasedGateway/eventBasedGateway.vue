<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import eventBasedSymbol from '@/assets/event-based-gateway-symbol.svg';


export default {
  extends: GatewayComponent,
  mounted() {
    this.shape.attr('image/xlink:href', eventBasedSymbol);
  },
};
</script>
