export default {
  component: 'FormAccordion',
  container: true,
  config: {
    initiallyOpen: true,
    label: 'Data Inputs & Assignments',
    icon: 'database',
    name: 'message-throw-event-data-inputs-accordion',
  },
  items: [
    {
      component: 'MessageThrowEventDataInputs',
      config: {
        label: 'Data Inputs',
        name: 'dataInputs',
        helper: 'Configure data inputs and their assignment expressions for the message payload',
      },
    },
  ],
};
