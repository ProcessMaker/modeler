export default [
  {
    name: 'Sequence Flow',
    items: [
      {
        component: 'FormText',
        config: {
          label: 'Sequence Flow',
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
          helper: 'The Name of the Sequence Flow',
          name: 'name',
        },
      },
      {
        component: 'FormInput',
        config: {
          label: 'Expression',
          helper: 'The Name of Expression',
          name: 'body',
        },
      },
    ],
  },
];
