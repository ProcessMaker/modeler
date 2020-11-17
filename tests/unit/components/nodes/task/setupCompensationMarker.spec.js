import setupCompensationMarker from '@/components/nodes/task/setupCompensationMarker';
import compensationIcon from '@/assets/compensation.svg';

describe('setupCompensationMarker', () => {

  it('can add a compensation marker', () => {
    const $set = jest.fn();

    const markers = {
      bottomCenter: {},
    };

    const nodeDefinition = {
      isForCompensation: true,
      get(prop) {
        return this[prop];
      },
    };

    setupCompensationMarker(nodeDefinition, markers, $set);

    expect($set).toHaveBeenCalledWith(markers.bottomCenter, 'compensation', compensationIcon);
  });
});
