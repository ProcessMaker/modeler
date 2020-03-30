import { getDefaultIconColor } from '@/components/nodeColors';

const encodeAsDataUri = (svgString) => {
  const base64 = btoa(svgString);
  return `data:image/svg+xml;base64,${base64}`;
};

/** returns a data URI encoded re-colored icon */
const coloredIcon = (iconString, node) => {
  const svgDocument = (new DOMParser()).parseFromString(iconString, 'text/xml');
  const iconColor = node.definition.get('color') || getDefaultIconColor(node);

  svgDocument.querySelectorAll('*[fill]:not([fill="none"])').forEach(svgNode => {
    svgNode.setAttribute('fill', iconColor);
  });

  svgDocument.querySelectorAll('*[stroke]:not([stroke="none"])').forEach(svgNode => {
    svgNode.setAttribute('stroke', iconColor);
  });

  return encodeAsDataUri(svgDocument.documentElement.outerHTML);
};

export default coloredIcon;
