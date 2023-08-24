import { camelCase, upperFirst } from 'lodash';
import Vuex from 'vuex';
import registerPmBlock from '@/setup/registerPmBlock.js';
import mainStore from './store.js';
import UndoRedoStore from './undoRedoStore.js';

const components = import.meta.glob('./**/*.vue', { import: 'default', eager: true });
const mixins = import.meta.glob('./mixins/**/*.js');

function install(Vue) {
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
  Vue.use(Vuex);

}

export default { install };

export {
  registerPmBlock,
  mainStore,
  UndoRedoStore,
};
export * from './components/nodes';
export * from './components/modeler';
export * from './components/validationStatus';
