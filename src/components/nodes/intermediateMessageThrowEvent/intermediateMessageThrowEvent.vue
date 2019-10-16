<template>
  <div/>
</template>

<script>
import IntermediateMessageEvent from '@/components/nodes/intermediateMessageEvent/intermediateMessageEvent';
import intermediateMailSymbol from '@/assets/intermediate-mail-alt.svg';

export default {
  extends: IntermediateMessageEvent,
  mounted() {
    this.shape.attr('image/xlink:href', intermediateMailSymbol);
  },
};
</script>
