const idConfigSettings  = {
  label: 'Identifier',
  helper: 'The id field should be unique across all elements in the diagram',
  name: 'id',
  validation: ['required', 'regex:/^[a-zA-Z][^\\s][a-zA-Z0-9_]+$/'],
};

export default idConfigSettings;
