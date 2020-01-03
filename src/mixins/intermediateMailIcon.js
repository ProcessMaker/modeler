export default function getIntermediateMailIconShapeAttributes(icon, stroke = '#000', strokeWidth = 1, fill = '#fff') {
  return {
    image: {
      xlinkHref: icon,
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
