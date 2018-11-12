export default [
  {
    name: 'Process Information',
    items: [
      {
        component: 'FormText',
        config: {
          label: 'Process',
          fontSize: '2em',
        },
      },
      {
        component: 'FormInput',
        config: {
          label: 'Identifier',
          helper: 'The id field should be unique across all elements in the diagram',
          name: 'id',
        },
      },
      {
        component: 'FormInput',
        config: {
          label: 'Name',
          helper: 'The Name of the Process',
          name: 'name',
          placeholder: '',
        },
      },
    ],
  },
];
