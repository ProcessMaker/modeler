import { anchors } from 'jointjs';
import { getDefaultAnchorPoint } from '@/portsUtils';

anchors.closestPort = (endView, endMagnet, anchorReference, { connectionPoint, shape, paper }) => {
  return getDefaultAnchorPoint(connectionPoint, shape.findView(paper));
};
