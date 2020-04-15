const idConfigSettings = {
  label: 'Node Identifier',
  helper: 'Enter the id that is unique from all other elements in the diagram',
  name: 'id',
  validation: 'required|regex:/^[_A-Za-z][-._A-Za-z0-9]*$/',
};

export default idConfigSettings;
