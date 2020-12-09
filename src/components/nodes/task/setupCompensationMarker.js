import compensationIcon from '@/assets/compensation.svg';

export default function setupCompensationMarker(nodeDefinition, markers, $set, $delete) {
  if (!nodeDefinition.isForCompensation) {
    $delete(markers.bottomCenter, 'compensation');
    return;
  }

  $set(markers.bottomCenter, 'compensation', compensationIcon);
}
