import nameConfigSettings from "@/components/inspectors/nameConfigSettings";
import advancedAccordionConfig from "@/components/inspectors/advancedAccordionConfig";
import documentationAccordionConfig from "@/components/inspectors/documentationAccordionConfig";
import component from "./sequenceFlow.vue";

export const id = "processmaker-modeler-sequence-flow";

export default {
  id,
  component,
  bpmnType: "bpmn:SequenceFlow",
  control: false,
  definition(moddle) {
    return moddle.create("bpmn:SequenceFlow", {
      name: null,
    });
  },
  diagram(moddle) {
    return moddle.create("bpmndi:BPMNEdge");
  },
  inspectorData(node) {
    // If the flow's source is doesn't have condition remove it:
    const hasCondition = ["bpmn:ExclusiveGateway", "bpmn:InclusiveGateway"].includes(node.definition.sourceRef.$type);
    if (!hasCondition) {
      delete node.definition.conditionExpression;
    }
    return Object.entries(node.definition).reduce((data, [key, value]) => {
      if (key === "conditionExpression") {
        data[key] = value.body;
      } else {
        data[key] = value;
      }

      return data;
    }, {});
  },
  inspectorHandler(value, node, setNodeProp, moddle) {
    const { definition } = node;

    // Exclusive and inclusive gateways could have conditioned flows
    const hasCondition = ["bpmn:ExclusiveGateway", "bpmn:InclusiveGateway"].includes(definition.sourceRef.$type);

    // Go through each property and rebind it to our data
    Object.keys(value).forEach((key) => {
      if (definition[key] === value[key]) {
        return;
      }

      if (key === "conditionExpression" && hasCondition) {
        // Set the condition expression IFF the expression body changed
        if (definition[key].body !== value[key]) {
          const conditionExpression = moddle.create("bpmn:FormalExpression", { body: value[key] });
          setNodeProp(node, key, conditionExpression);
        }
      } else {
        setNodeProp(node, key, value[key]);
      }
    });
  },
  inspectorConfig: [
    {
      name: "Sequence Flow",
      items: [
        {
          component: "FormAccordion",
          container: true,
          config: {
            initiallyOpen: true,
            label: "Configuration",
            icon: "cog",
            name: "inspector-accordion-sequence-flow",
          },
          items: [
            {
              component: "FormInput",
              config: { ...nameConfigSettings, validation: null },
            },
          ],
        },
        documentationAccordionConfig,
        advancedAccordionConfig,
      ],
    },
  ],
};
