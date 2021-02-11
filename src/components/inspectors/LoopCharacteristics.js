import LoopCharactetistics from '@/components/inspectors/LoopCharacteristics.vue';
import NodeInspector from '@/NodeInspector';
import omit from 'lodash/omit';

export const loopCharacteristicsHandler = function(value, node, setNodeProp, moddle, definitions) {
  const nodeInspector = new NodeInspector(definitions);
  nodeInspector.setDefinitionProps(value.$loopCharactetistics, setNodeProp, moddle, node.definition);
  if (node.definition.loopCharacteristics) {
    setNodeProp(node, 'loopCharacteristics', node.definition.loopCharacteristics);
  }
  if (node.definition.ioSpecification) {
    setNodeProp(node, 'ioSpecification', node.definition.ioSpecification);
  }
  return omit(value, ['$loopCharactetistics']);
};

export const loopCharacteristicsData = function(inspectorData, node, defaultDataTransform, { definitions }) {
  const nodeInspector = new NodeInspector(definitions);
  inspectorData.$loopCharactetistics = nodeInspector.getDefinitionProps({
    id: node.definition.id,
    loopCharacteristics: node.definition.loopCharacteristics,
    ioSpecification: node.definition.ioSpecification,
  });
  delete inspectorData.loopCharacteristics;
  delete inspectorData.ioSpecification;
};

export default {
  component: 'FormAccordion',
  container: true,
  config: {
    initiallyOpen: false,
    label: 'Loop Characteristics',
    icon: 'bars',
    name: 'loop-characteristics-accordion',
  },
  items: [
    {
      component: LoopCharactetistics,
      name: 'LoopCharactetistics',
      config: {
        name: '$loopCharactetistics',
      },
    },
  ],
};
