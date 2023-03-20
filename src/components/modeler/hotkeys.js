export default function zoomCanvas(key, canvasScale) {
  let scale = canvasScale, 
    minimumScale = 0.2,
    scaleStep = 0.1;

  switch (key) {
    case '+':
      scale += scaleStep;
      break;

    case '-':
      scale = Math.max(minimumScale, scale -= scaleStep);
      break;
    
    default:
      break;
  }
  
  return scale;
}
