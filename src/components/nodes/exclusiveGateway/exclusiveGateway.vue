<script>
import GatewayComponent from '@/components/nodes/gateway/gateway';
import exclusiveGatewaySymbol from '@/assets/exclusive-gateway-symbol.svg';

export default {
  extends: GatewayComponent,
  data() {
    return {
      dropdownData: [
        {
          label: 'Exclusive Gateway',
          nodeType: 'processmaker-modeler-exclusive-gateway',
        },
        {
          label: 'Inclusive Gateway',
          nodeType: 'processmaker-modeler-inclusive-gateway',
        },
        {
          label: 'Parallel Gateway',
          nodeType: 'processmaker-modeler-parallel-gateway',
        },
        {
          label: 'Event Based Gateway',
          nodeType: 'processmaker-modeler-event-based-gateway',
        },
      ],
    };
  },
  mounted() {
    this.shape.attr('image/xlink:href', exclusiveGatewaySymbol);
  },
};
</script>
