import setupMultiInstanceMarkers from '@/components/nodes/task/setupMultiInstanceMarkers';

describe('setupMultiInstanceMarkers', () => {
  it('does not set up markers for task without loop characteristics', () => {
    const $set = jest.fn();
    const nodeDefinition = { get(){} };

    setupMultiInstanceMarkers(nodeDefinition, {}, $set);

    expect($set).not.toHaveBeenCalled();
  });
});
