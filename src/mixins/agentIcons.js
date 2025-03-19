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
      // check if element is for agent
      if (!(store.getters.isForAgentAI ?? false)) {
        return;
      }
      this._initializeIconView();
    },

    _initializeIconView() {
      const view = this.paper.findViewByModel(this.shape);
      if (!view) return;

      this._setupIconInterval(view);
    },

    _setupIconInterval(view) {
      const interval = window.setInterval(() => {
        this._updateIconAttributes(view);
        clearInterval(interval);
      }, 200);
    },

    _updateIconAttributes(view) {
      view.model.attr({
        [ICON_CONFIG.SELECTORS.AGENT]: {
          display: this.node ? 'block' : 'none',
        },
      });
    },
  },
};