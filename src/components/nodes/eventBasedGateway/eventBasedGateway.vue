<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import eventBasedSymbol from '!!svg-inline-loader!@/assets/event-based-gateway-symbol.svg';
import updateIconColor from '@/mixins/updateIconColor';


export default {
  extends: GatewayComponent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: eventBasedSymbol,
    };
  },
};
</script>
