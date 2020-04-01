<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import parallelGatewaySymbol from '!!svg-inline-loader!@/assets/parallel-gateway-symbol.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: GatewayComponent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: parallelGatewaySymbol,
    };
  },
};
</script>
