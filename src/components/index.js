import { camelCase, upperFirst } from 'lodash';

const components = import.meta.glob('../**/*.vue', { import: 'default', eager: true });
const mixins = import.meta.glob('../mixins/**/*.js');

const Modeler = {
  install(Vue) {
    // First check to see if we're already installed
    if (this._processMakerVueFormElementsInstalled) {
      return;
    }

    // Boolean flag to see if we're already installed
    this._processMakerVueFormElementsInstalled = true;
    for (const component in components) {
      const name = component.name ? component.name : upperFirst(camelCase(
        // retrieve the file name regardless of folder depth
        component
          .split('/')
          .pop()
          .replace(/\.\w+$/, ''),
      ));
      Vue.component(name, components[component].default || components[component]);
    }
    for (const mixin in mixins) {
      Vue.mixin(mixins[mixin].name);
    }
  },
};

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Modeler);
}

export default Modeler;
export * from './nodes/index.js';
