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

const containsSvg = (str) => {
  // Regular expression to match a URL pattern
  const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;

  // Regular expression to check if the string contains '.svg'
  const pathPattern = /\.svg/;
  
  // Check if the string contains an SVG root element
  const stringPattern = /<svg[^>]*>/;

  const encodedStringPattern = /^<\?xml/.test(str) && /<svg[^>]*>/.test(str);

  // Check if the variable is a string and either a URL or contains '.svg'
  return typeof str === 'string' && (urlPattern.test(str) || pathPattern.test(str) || stringPattern.test(str) || encodedStringPattern);
};

const coloredIcon = (iconString, node) => {
  if (!containsSvg(iconString)) {
    // If the input is not an SVG, add Font Awesome icons and extract the SVG
    library.add(fas, fab);

    const [prefix, iconClass] = iconString.split(' ');
    const [classPrefix, iconName] = iconString.split('-');
    const iconDefinition = findIconDefinition({ prefix, iconName });
    const svg = icon(iconDefinition).html;
    iconString = svg[0];
  }

  const iconColor = getColorOrDefault(node);
  const recoloredSvg = recolorSvg(iconString, iconColor);

  return encodeAsDataUri(recoloredSvg);
};

export default coloredIcon;
