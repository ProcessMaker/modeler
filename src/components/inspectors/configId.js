export const configId  = {
  id: 'id',
  validation: ['required', 'regex:/^[a-zA-Z][^\\s][a-zA-Z0-9_]+$/'],
  helper: 'The id field should be unique across all elements in the diagram, ex. id_1.',
};
