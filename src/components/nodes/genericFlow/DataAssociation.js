import Flow from '@/components/nodes/genericFlow/Flow';

export default class DataAssociation extends Flow {
   static dataNodeTypes = ['bpmn:DataStoreReference', 'bpmn:DataObjectReference'];
   static disallowedNodes = [
     'bpmn:EndEvent',
     'bpmn:MessageFlow',
     'bpmn:SequenceFlow',
     'bpmn:Participant',
     'bpmn:Lane',
     'bpmn:TextAnnotation',
     'bpmn:Association',
   ];

   static isADataNode(node) {
     return node.isBpmnType(...DataAssociation.dataNodeTypes);
   }

   static isNodeDisallowedFromDataAssociation(node) {
     return node.isBpmnType(...DataAssociation.disallowedNodes);
   }
}
