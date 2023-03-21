import Vue from 'vue';

export function setDefinitionPropertyReactive(definition, key, value) {
  if (definition.hasOwnProperty(key)) {
    definition.set(key, value);
    return;
  }

  delete Object.getPrototypeOf(definition)[key];
  Vue.set(definition, key, value);
}

export function removeRef(state, ref, callBack) {
  state.nodes
    .filter(
      ({ definition }) =>
        (definition.$type === 'bpmn:IntermediateCatchEvent' ||
          definition.$type === 'bpmn:StartEvent') &&
        definition.eventDefinitions &&
        definition.eventDefinitions.some(callBack)
    )
    .forEach(({ definition }) => {
      definition.eventDefinitions[0][ref] = null;
    });
}
