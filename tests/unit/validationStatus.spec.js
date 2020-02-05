import errorList from '@/components/validationStatus/errorListUtil';
import uniqBy from 'lodash/uniqBy';

describe('Validation Status', () => {
  it('Should not contain duplicate errorIds', () => {
    const errors = {
      'sameErrorType': [
        {'id': 'node_1'},
        {'id': 'node_1'},
        {'id': 'node_1'},
        {'id': 'node_1'},
        {'id': 'node_1'},
      ],
    };

    const list = errorList(errors);
    expect(uniqBy(list, 'errorId')).toHaveLength(list.length);
  });
});
