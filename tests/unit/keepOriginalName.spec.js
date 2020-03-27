import { keepOriginalName} from '@/components/modeler/modelerUtils';
import Node from '@/components/nodes/node';

describe('Switch Types', () => {
  it('Should keep unique Task name', () => {
    const node = new Node(
      'processmaker-modeler-script-task',
      { id: 'test', name: 'Unique Task Name' },
      {},
    );
    expect(keepOriginalName(node)).toBe(true);
  });
  it('Should switch default Task name', () => {
    const node = new Node(
      'processmaker-modeler-script-task',
      { id: 'test', name: 'Form Task' },
      {},
    );
    expect(keepOriginalName(node)).toBe(false);
  });
  it('Should keep unique Start name', () => {
    const node = new Node(
      'processmaker-modeler-start-timer-event',
      { id: 'test', name: 'Unique Start Event Name' },
      {},
    );
    expect(keepOriginalName(node)).toBe(true);
  });
  it('Should switch default Start name', () => {
    const node = new Node(
      'processmaker-modeler-start-timer-event',
      { id: 'test', name: 'Start Event' },
      {},
    );
    expect(keepOriginalName(node)).toBe(false);
  });
  it('Should keep unique End name', () => {
    const node = new Node(
      'processmaker-modeler-message-end-event',
      { id: 'test', name: 'Unique End Event Name' },
      {},
    );
    expect(keepOriginalName(node)).toBe(true);
  });
  it('Should switch default End name', () => {
    const node = new Node(
      'processmaker-modeler-message-end-event',
      { id: 'test', name: 'End Event' },
      {},
    );
    expect(keepOriginalName(node)).toBe(false);
  });
  it('Should keep unique Intermediate name', () => {
    const node = new Node(
      'processmaker-modeler-intermediate-catch-timer-event',
      { id: 'test', name: 'Unique Intermediate Event Name' },
      {},
    );
    expect(keepOriginalName(node)).toBe(true);
  });
  it('Should switch default Intermediate name', () => {
    const node = new Node(
      'processmaker-modeler-intermediate-catch-timer-event',
      { id: 'test', name: 'Intermediate Message Catch Event' },
      {},
    );
    expect(keepOriginalName(node)).toBe(false);
  });
  it('Should keep unique Gateway name', () => {
    const node = new Node(
      'processmaker-modeler-parallel-gateway',
      { id: 'test', name: 'Unique Gateway Name' },
      {},
    );
    expect(keepOriginalName(node)).toBe(true);
  });
  it('Should switch default Gateway name', () => {
    const node = new Node(
      'processmaker-modeler-parallel-gateway',
      { id: 'test', name: 'Exclusive Gateway' },
      {},
    );
    expect(keepOriginalName(node)).toBe(false);
  });
});
