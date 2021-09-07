import LoopCharactetistics from '@/components/inspectors/LoopCharacteristics.vue';
import NodeInspector from '@/NodeInspector';
import omit from 'lodash/omit';

export const loopCharacteristicsHandler = function(value, node, setNodeProp, moddle, definitions) {
  const nodeInspector = new NodeInspector(definitions, { prefix: `${node.definition.id}_inner` });
  let update = nodeInspector.setDefinitionProps(value.$loopCharactetistics, setNodeProp, moddle, {});
  update = nodeInspector.setReferences(update);
  if (update.loopCharacteristics) {
    delete node.definition.loopCharacteristics;
    setNodeProp(node, 'loopCharacteristics', update.loopCharacteristics);
  } else {
    node.definition.loopCharacteristics = null;
    delete node.definition.loopCharacteristics;
  }
  if (update.ioSpecification) {
    delete node.definition.ioSpecification;
    setNodeProp(node, 'ioSpecification', update.ioSpecification);
  } else {
    delete node.definition.ioSpecification;
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
    label: 'Loop Activity',
    icon: 'redo',
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
