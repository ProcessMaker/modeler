import sequentialIcon from '@/assets/sequential.svg?url';
import parallelIcon from '@/assets/parallel.svg?url';
import loopIcon from '@/assets/loop.svg?url';

const standardLoop = 'bpmn:StandardLoopCharacteristics';
const multiInstanceLoop = 'bpmn:MultiInstanceLoopCharacteristics';

export default function setupMultiInstanceMarkers(nodeDefinition, markers, $set, $delete) {
  const loopCharacteristics = nodeDefinition.get('loopCharacteristics');

  const handledLoopTypes = [
    standardLoop,
    multiInstanceLoop,
  ];

  if (!loopCharacteristics || !handledLoopTypes.includes(loopCharacteristics.$type)) {
    $delete(markers.bottomCenter, 'loopCharacteristics');
    return;
  }

  if (loopCharacteristics.$type === standardLoop) {
    $set(markers.bottomCenter, 'loopCharacteristics', loopIcon);
    return;
  }

  const multiInstanceIcon = loopCharacteristics.isSequential ? sequentialIcon : parallelIcon;
  $set(markers.bottomCenter, 'loopCharacteristics', multiInstanceIcon);
}
