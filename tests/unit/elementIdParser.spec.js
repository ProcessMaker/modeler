import { elementIdParser } from '@/components/nodes/subProcess/elementIdParser';

describe('element id parser', () => {
  it.each(['abcd-1234', 'ghghghghghgh-123', 'abcd-efgh-12345'])('should correctly parse element id %s', elementId => {
    const expectedOwnerProcessId = elementId.substring(0, elementId.lastIndexOf('-'));
    const expectedProcessId = elementId.substring(elementId.lastIndexOf('-') + 1);

    const { ownerProcessId, processId } = elementIdParser(elementId);

    expect(ownerProcessId).toEqual(expectedOwnerProcessId);
    expect(processId).toEqual(expectedProcessId);
  });
});
