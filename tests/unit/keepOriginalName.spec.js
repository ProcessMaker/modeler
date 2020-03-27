import { keepOriginalName} from '@/components/modeler/modelerUtils';
import Node from '@/components/nodes/node';

describe('Switch Types', () => {
  const nodeTypes = [
    ['Form Task', 'processmaker-modeler-script-task'],
    ['Start Event', 'processmaker-modeler-start-timer-event'],
    ['End Event', 'processmaker-modeler-message-end-event'],
    ['Intermediate Message Catch Event', 'processmaker-modeler-intermediate-catch-timer-event'],
    ['Exclusive Gateway', 'processmaker-modeler-parallel-gateway'],
  ];

  it.each(nodeTypes)('Should keep unique %s name', (name, type) => {
    const node = new Node(
      type,
      { id: 'test', name: `Unique ${name} Name` },
      {},
    );
    expect(keepOriginalName(node)).toBe(true);
  });
  it.each(nodeTypes)('Should switch default %s name', (name, type) => {
    const node = new Node(
      type,
      { id: 'test', name },
      {},
    );
    expect(keepOriginalName(node)).toBe(false);
  });
});
