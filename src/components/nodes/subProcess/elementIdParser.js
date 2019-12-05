export function elementIdParser(calledElement) {
  const ownerProcessId = calledElement.substring(0, calledElement.lastIndexOf('-'));
  const processId = calledElement.substring(calledElement.lastIndexOf('-') + 1);

  return { ownerProcessId, processId };
}
