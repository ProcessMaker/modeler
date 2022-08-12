import { getDefaultNodeColors, setShapeColor } from "./nodeColors";

export default function resetShapeColor(shape) {
  const { node } = shape.component;
  const color = node.definition.get("color");
  const { fill, stroke } = getDefaultNodeColors(node, color);

  setShapeColor(shape, fill, stroke);
}
