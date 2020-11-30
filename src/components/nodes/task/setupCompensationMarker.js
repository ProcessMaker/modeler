import compensationIcon from '@/assets/compensation.svg';

export default function setupCompensationMarker(nodeDefinition, markers, $set) {
  if (nodeDefinition.isForCompensation) {
    $set(markers.bottomCenter, 'compensation', compensationIcon);
  } else {
    $set(markers.bottomCenter, 'compensation', null);
  }
}
