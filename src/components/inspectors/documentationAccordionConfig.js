import DocumentationFormTextArea from "./DocumentationFormTextArea.vue";

export default {
  component: "FormAccordion",
  container: true,
  config: {
    initiallyOpen: false,
    label: "Documentation",
    icon: "book",
    name: "documentation-accordion",
  },
  items: [
    {
      component: DocumentationFormTextArea,
      config: {
        label: "Description",
        name: "documentation",
        helper: "",
      },
    },
  ],
};
