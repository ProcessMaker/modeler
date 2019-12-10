const idConfigSettings = {
  label: 'Node Identifier',
  helper: 'Enter the id that is unique from all other elements in the diagram',
  name: 'id',
  validation: ['required', 'regex:/^[a-zA-Z][^\\s][a-zA-Z0-9_-]+$/'],
};

export default idConfigSettings;
