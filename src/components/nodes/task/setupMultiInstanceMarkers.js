import sequentialIcon from '@/assets/sequential.svg';
import parallelIcon from '@/assets/parallel.svg';

export default function setupMultiInstanceMarker(nodeDefinition, markers, $set) {
  const loopCharacteristics = nodeDefinition.get('loopCharacteristics');
  const isMultiInstance = loopCharacteristics ?
    loopCharacteristics.$type === 'bpmn:MultiInstanceLoopCharacteristics' :
    false;
  const isSequential = isMultiInstance ? loopCharacteristics.isSequential : false;
  if (isMultiInstance) {
    $set(markers.bottomCenter, 'multiInstance', isSequential ? sequentialIcon : parallelIcon);
  }
}
