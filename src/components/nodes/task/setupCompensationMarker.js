import compensationIcon from '@/assets/compensation.svg';

export default function setupCompensationMarker(nodeDefinition, markers, $set) {
  const icon = nodeDefinition.isForCompensation ? compensationIcon : null;
  $set(markers.bottomCenter, 'compensation', icon);
}
