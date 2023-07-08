import setupMultiInstanceMarkers from '@/components/nodes/task/setupMultiInstanceMarkers';
import sequentialIcon from '@/assets/sequential.svg';
import parallelIcon from '@/assets/parallel.svg';
import loopIcon from '@/assets/loop.svg';

describe('setupMultiInstanceMarkers', () => {
  let $set = jest.fn();
  let $delete = jest.fn();
  let markers = {
    bottomCenter: {},
  };

  it('does not set up markers for task without loop characteristics', () => {
    const nodeDefinition = { get(){} };

    setupMultiInstanceMarkers(nodeDefinition, {}, $set, $delete);

    expect($set).not.toHaveBeenCalled();
    expect($delete).toHaveBeenCalledTimes(1);
  });

  it('sets sequential icon for sequential multi instance task', () => {
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

    expect($set).toHaveBeenCalledWith(markers.bottomCenter, 'loopCharacteristics', sequentialIcon);
  });

  it('sets parallel icon for parallel multi instance task', () => {
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

    expect($set).toHaveBeenCalledWith(markers.bottomCenter, 'loopCharacteristics', parallelIcon);
  });

  it('sets loop icon for standard loop characteristics task', () => {
    const nodeDefinition = {
      loopCharacteristics: {
        $type: 'bpmn:StandardLoopCharacteristics',
      },
      get(prop) {
        return this[prop];
      },
    };

    setupMultiInstanceMarkers(nodeDefinition, markers, $set);

    expect($set).toHaveBeenCalledWith(markers.bottomCenter, 'loopCharacteristics', loopIcon);
  });

  it('can add a compensation marker', () => {
    const nodeDefinition = {
      loopCharacteristics: {
        $type: 'bpmn:StandardLoopCharacteristics',
      },
      get(prop) {
        return this[prop];
      },
    };

    setupMultiInstanceMarkers(nodeDefinition, markers, $set);

    expect($set).toHaveBeenCalledWith(markers.bottomCenter, 'loopCharacteristics', loopIcon);
  });
});
