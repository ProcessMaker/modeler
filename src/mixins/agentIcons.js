import store from '@/store';

const ICON_CONFIG = {
  DIMENSIONS: {
    WIDTH: 20,
    HEIGHT: 20,
  },
  POSITION: {
    X: -4,
    Y: 18,
  },
  SELECTORS: {
    AGENT: 'agenticon',
  },
  IMAGE: {
    URL: require('@/assets/icon-ai.svg'),
  },
};

export function agentIconAdaptMarkup(markup, forAgent) {
  return forAgent 
    ? markup 
    : markup.filter(item => !['agenticon'].includes(item.selector));
}

export function agentIconMarkup(selector) {
  const markups = [
    {
      tagName: 'image',
      selector: ICON_CONFIG.SELECTORS.AGENT,
    },
  ];

  return markups.find(item => item.selector === selector);
}

export function agentIconAttrs(selector, customValues) {
  const attrs = [
    {
      selector: ICON_CONFIG.SELECTORS.AGENT,
      attributes: {
        'xlink:href': ICON_CONFIG.IMAGE.URL,
        x: ICON_CONFIG.POSITION.X,
        y: ICON_CONFIG.POSITION.Y,
        width: ICON_CONFIG.DIMENSIONS.WIDTH,
        height: ICON_CONFIG.DIMENSIONS.HEIGHT,
        'data-test': 'nodeagenticon',
        display: 'none',
      },
    },
  ];

  const selectorAttributes = attrs.find(item => item.selector === selector)?.attributes;
  if (!selectorAttributes) return {};

  return {
    [selector]: { ...selectorAttributes, ...customValues },
  };
}

export default {
  methods: {
    initAgentIcons() {
      window.ProcessMaker.EventBus.$on('init-agent-icons', (definition) => {
        if (definition.id === this.node.definition.id) {
          this.node.definition = definition;
          this._initializeIconView();
        }
      });

      this._initializeIconView();
    },

    _initializeIconView() {
      const view = this.paper.findViewByModel(this.shape);
      if (!view) return;

      this._updateIconAttributes(view);
    },

    _updateIconAttributes(view) {
      let enabled = 'none';
      try {
        const configString = _.get(this.node.definition, 'config')
        if (configString) {
          const config = JSON.parse(configString);
          enabled = config?.gateway_agent?.enable_gateway_ai ? 'block' : 'none';
        }
      } catch (error) {
        enabled = 'none';
      }
      view.model.attr({
        [ICON_CONFIG.SELECTORS.AGENT]: {
          display: enabled,
        },
      });
      
    },
  },
};