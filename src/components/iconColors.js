const encodeAsDataUri = (svgString) => {
  const base64 = btoa(svgString);
  return `data:image/svg+xml;base64,${ base64 }`;
};

/** returns a data URI encoded re-colored icon */
const coloredIcon = (iconString, color = '') => {
  const svgDocument = (new DOMParser()).parseFromString(iconString, 'text/xml');
  if (color) {
    svgDocument.querySelectorAll('*[fill]:not([fill="none"])').forEach(svgNode => {
      svgNode.setAttribute('fill', color);
    });
    svgDocument.querySelectorAll('*[stroke]:not([stroke="none"])').forEach(svgNode => {
      svgNode.setAttribute('stroke', color);
    });
  }

  return encodeAsDataUri(svgDocument.documentElement.outerHTML);
};

export default coloredIcon;
