import LoopCharactetistics from '@/components/inspectors/LoopCharacteristics.vue';

export default {
  component: 'FormAccordion',
  container: true,
  config: {
    initiallyOpen: false,
    label: 'LoopCharacteristics',
    icon: 'bars',
    name: 'loop-characteristics-accordion',
  },
  items: [
    {
      component: LoopCharactetistics,
      name: 'LoopCharactetistics',
      config: {
        name: '$loopCharactetistics',
      },
    },
  ],
};
