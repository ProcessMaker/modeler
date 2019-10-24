<script>
import intermediateMailSymbol from '@/assets/intermediate-mail.svg';

export default {
  mounted() {
    this.shape.attr('image/xlink:href', intermediateMailSymbol);
    this.shape.attr({
      body: {
        stroke: '#000',
        strokeWidth: 1,
        fill: '#fff',
      },
      body2: {
        stroke: '#000',
        strokeWidth: 1,
        fill: '#fff',
      },
      image: {
        width: 20,
        height: 20,
        y: 3,
        x: 3,
      },
    });
  },
};
</script>