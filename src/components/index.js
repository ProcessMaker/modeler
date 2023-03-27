const components = import.meta.glob('./**/*.vue', {
  import: 'default',
  eager: true,
});
const mixins = import.meta.glob('../mixins/**/*.js', {
  import: 'default',
  eager: true,
});

function install(Vue) {
  // First check to see if we're already installed
  if (this._processMakerVueFormElementsInstalled) {
    return;
  }

  // Boolean flag to see if we're already installed
  this._processMakerVueFormElementsInstalled = true;
  for (const component in components) {
    if (!components[component].name) components[component].name = component;
    Vue.component(components[component].name, components[component]);
  }
  for (const mixin in mixins) {
    Vue.mixin(mixins[mixin].name);
  }
}

export default { install };
