import Gateway from '@/components/nodes/gateway/gateway';
import idConfigSettings from '@/components/inspectors/idConfigSettings';

const PM4Ai = {
  name: 'ProcessMakerAI',
  uri: 'http://processmaker.com/BPMN/2.0/AISchema.xsd',
  prefix: 'ai',
  xml: {
    tagAlias: 'lowerCase',
  },
  associations: [],
  types: [
    {
      name: 'AiEmbeddingGateway',
      properties: [
        {
          name: 'screenRef',
          isAttr: true,
          type: 'String',
        },
      ],
    },
  ],
  emumerations: [],
};
window.ProcessMaker.EventBus.$on(
  'modeler-init',
  ({ registerNode, registerBpmnExtension }) => {
    registerBpmnExtension('ai', PM4Ai);

    const nodeId = 'processmaker-ai-embedding-gateway';

    const component = {
      extends: Gateway,
    };

    const nodeType = {
      bpmnType: 'bpmn:ExclusiveGateway',
      id: nodeId,
      component,
      control: true,
      category: 'AI',
      icon: require('@/assets/ai/gateway-embedding.svg'),
      label: 'Embedding Gateway',
      definition(moddle) {
        const gateway = moddle.create('bpmn:ExclusiveGateway', {
          name: '',
        });
        const extensionElements = moddle.create('bpmn:ExtensionElements');
        const customElement = moddle.create('ai:AiEmbeddingGateway', {});
        extensionElements.get('values').push(customElement);
        gateway.set('extensionElements', extensionElements);
        return gateway;
      },
      diagram(moddle) {
        return moddle.create('bpmndi:BPMNShape', {
          bounds: moddle.create('dc:Bounds', {
            height: 36,
            width: 36,
          }),
        });
      },
      inspectorConfig: [
        {
          name: 'Embedding Gateway',
          items: [
            {
              component: 'FormInput',
              config: idConfigSettings,
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'Name',
                name: 'name',
                validation: 'required',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Input Variable',
                helper: 'Input Variable',
                name: 'extensionElements.values[0].variable',
                validation: 'required',
              },
            },
          ],
        },
      ],
    };

    registerNode(nodeType, (definition) => {
      // custom node identifier
      if (definition.get('extensionElements')) {
        const extensionElements = definition.get('extensionElements');
        const customElement = extensionElements.get('values')[0];
        if (customElement.$type === 'pm:aiEmbeddingGateway') {
          return nodeId;
        }
      }
    });
  }
);
