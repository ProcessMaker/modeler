import { getDefaultIconColor } from '@/components/nodeColors';
import { library, icon, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

const encodeAsDataUri = (svgString) => {
  const base64 = btoa(svgString);
  return `data:image/svg+xml;base64,${base64}`;
};

const getColorOrDefault = (node) => {
  return node.definition.get('color') || getDefaultIconColor(node);
};

const recolorSvg = (svgString, color) => {
  const svgDocument = new DOMParser().parseFromString(svgString, 'text/xml');
  const svgNodesWithFill = svgDocument.querySelectorAll('*[fill]:not([fill="none"])');
  const svgNodesWithStroke = svgDocument.querySelectorAll('*[stroke]:not([stroke="none"])');

  svgNodesWithFill.forEach((svgNode) => {
    svgNode.setAttribute('fill', color);
  });

  svgNodesWithStroke.forEach((svgNode) => {
    svgNode.setAttribute('stroke', color);
  });

  return svgDocument.documentElement.outerHTML;
};

const isSVGEncodedString = (str) => {
  // Check if the string starts with the XML declaration and contains an SVG root element
  return /^<\?xml/.test(str) && /<svg[^>]*>/.test(str);
};

const isSVGString = (str) => {
  // Check if the string contains an SVG root element
  return /<svg[^>]*>/.test(str);
};

const coloredIcon = (iconString, node) => {
  if (!isSVGString(iconString) && !isSVGEncodedString(iconString)) {
    library.add(fas, fab);

    const [prefix, iconName] = iconString.split('-');
    const iconDefinition = findIconDefinition({ prefix, iconName });
    const svg = icon(iconDefinition).html;
    iconString = svg[0];
  }

  const iconColor = getColorOrDefault(node);
  const recoloredSvg = recolorSvg(iconString, iconColor);

  return encodeAsDataUri(recoloredSvg);
};

export default coloredIcon;
