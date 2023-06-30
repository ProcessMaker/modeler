import errorList from '@/components/validationStatus/errorListUtil';
import uniqBy from 'lodash/uniqBy';

describe('Validation Status', () => {
  it('Should contain unique errorIds', () => {
    const errors = {
      'processmaker/gateway-direction': [
        { 'id': 'node_1', 'message': 'Gateway must have multiple outgoing Sequence Flows.' },
        { 'id': 'node_1', 'message': 'Gateway must not have multiple incoming Sequence Flows.' },
      ],
    };

    const list = errorList(errors);
    expect(uniqBy(list, 'errorId')).toHaveLength(list.length);
  });
});
