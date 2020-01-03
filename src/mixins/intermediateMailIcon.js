import intermediateMailSymbol from '@/assets/intermediate-mail.svg';

export default function getIntermediateMailIconShapeAttributes(stroke = '#000', strokeWidth = 1, fill = '#fff') {
  return {
    image: {
      xlinkHref: intermediateMailSymbol,
      width: 20,
      height: 20,
      y: 3,
      x: 3,
    },
    body: {
      stroke,
      strokeWidth,
      fill,
    },
    body2: {
      stroke,
      strokeWidth,
      fill,
    },
  };
}
