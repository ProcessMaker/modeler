import setupMultiInstanceMarkers from '@/components/nodes/task/setupMultiInstanceMarkers';
import sequentialIcon from '@/assets/sequential.svg';
import parallelIcon from '@/assets/parallel.svg';

describe('setupMultiInstanceMarkers', () => {
  it('does not set up markers for task without loop characteristics', () => {
    const $set = jest.fn();
    const nodeDefinition = { get(){} };

    setupMultiInstanceMarkers(nodeDefinition, {}, $set);

    expect($set).not.toHaveBeenCalled();
  });

  it('sets sequential icon for sequential multi instance task', () => {
    const $set = jest.fn();

    const markers = {
      bottomCenter: {},
    };

    const nodeDefinition = {
      loopCharacteristics: {
        $type: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: true,
      },
      get(prop) {
        return this[prop];
      },
    };

    setupMultiInstanceMarkers(nodeDefinition, markers, $set);

    expect($set).toHaveBeenCalledWith(markers.bottomCenter, 'multiInstance', sequentialIcon);
  });

  it('sets parallel icon for parallel multi instance task', () => {
    const $set = jest.fn();

    const markers = {
      bottomCenter: {},
    };

    const nodeDefinition = {
      loopCharacteristics: {
        $type: 'bpmn:MultiInstanceLoopCharacteristics',
        isSequential: false,
      },
      get(prop) {
        return this[prop];
      },
    };

    setupMultiInstanceMarkers(nodeDefinition, markers, $set);

    expect($set).toHaveBeenCalledWith(markers.bottomCenter, 'multiInstance', parallelIcon);
  });
});
