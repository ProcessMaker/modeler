# ProcessMaker BPMN modeler

[![CircleCI](https://circleci.com/gh/ProcessMaker/modeler.svg?style=svg)](https://circleci.com/gh/ProcessMaker/modeler)

`@processmaker/modeler` is a Vue.js based BPMN modeler scaffolded using [Vue CLI 3](https://cli.vuejs.org/).

- [Project setup](#project-setup)
- [Testing](#testing)
- [Architecture](#architecture)
  - [Global event bus](#global-event-bus)
    - [`modeler-init`](#modeler-init)
    - [`modeler-start`](#modeler-start)
    - [`modeler-validate`](#modeler-validate)
    - [`modeler-change`](#modeler-change)
  - [Undo/redo store](#undoredo-store)
  - [Validation](#validation)
    - [Adding a new lint rule](#adding-a-new-lint-rule)
    - [Adding validation rules during runtime](#adding-validation-rules-during-runtime)
- [Examples](#examples)
  - [Adding a new component](#adding-a-new-component)

## Project setup

Clone the repository and `cd` into the `modeler` directory:

```bash
git clone git@github.com:ProcessMaker/modeler.git
cd modeler
```

You can now run any of the below commands. Most commands make calls `vue-cli-service`. You can read more about those commands at https://cli.vuejs.org/guide/cli-service.html#cli-service.

```bash
# Compile the app and start a local development server
npm run serve

# Create a production build of the app to be distributed as an npm package
npm run build-bundle

# Report and fix ESLint errors
npm run lint
```

## Testing

Unit tests are set up using jest and end-to-end tests are set up using Cypress. Unit and end-to-end tests can be run separately or together. Code coverage is collected for both types of tests and combined into a single coverage report for the entire project. 

Tests can be run locally with the following commands:

```bash
# Run the Jest unit test suite
npm run test-unit

# Open Cypress to run the end-to-end (e2e) test suite
npm run open-cypress

# Run the Cypress end-to-end (e2e) test suite in headless mode
npm run test-ci

# Run the Jest unit test tests and then the Cypress tests in headless mode
npm test
```

Tests are run automatically on CircleCI when new branches are created and updated. The CI uses the `npm test` command to run both the unit and e2e test suites and to collect code coverage.

For more information on Cypress, visit [https://cli.vuejs.org/config/#cypress](https://cli.vuejs.org/config/#cypress).

For more information on Jest, visit [https://jestjs.io](https://jestjs.io).

## Architecture

The [entry point](https://webpack.js.org/configuration/entry-context/#entry) for the application is `src/main.js`; this is the "starting point" which is used when running `npm run serve` or `npm run build`.

### Global event bus

`window.ProcessMaker.EventBus` points to an independent Vue instance which acts as the application's global event bus. The modeler currently emits two events on the event bus which can be listened to in application code to hook into, customize, and extend the modeler's behaviour: `modeler-init`, and `modeler-start`.

#### `modeler-init`

This event is fired before the modeler and [BpmnModdle](https://github.com/bpmn-io/bpmn-moddle) are set up and mounted. Listeners to this event are passed an object with three methods: `registerInspectorExtension`, `registerBpmnExtension`, and `registerNode`.

```javascript
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker.json';
import { intermediateMessageCatchEvent } from '@/components/nodes';

window.ProcessMaker.EventBus.$on('modeler-init', ({ registerBpmnExtension, registerNode, registerInspectorExtension }) => {

  /* Add a BPMN extension */
  registerBpmnExtension('pm', bpmnExtension);

  /* Register a component to be used in the modeler */
  registerNode(intermediateMessageCatchEvent);

  /* Add custom properties to inspector */
  registerInspectorExtension(intermediateMessageCatchEvent, {
    id: 'pm-condition',
    component: 'FormInput',
    config: {
      label: 'Condition',
      helper: 'Expression to be evaluated on webhook to activate event. Leave blank to accept always.',
      name: 'pm:condition',
    },
  });

});
```

#### `modeler-start`

This event is fired after the modeler has been set up and mounted. Listeners to this event are passed an object with a single method, `loadXML`.

```javascript
window.ProcessMaker.EventBus.$on('modeler-start', ({ loadXML }) => {

  loadXML('<?xml version="1.0" encoding="UTF-8"?> ... </bpmn:definitions>');

});
```

For the modeler to function correctly, `loadXML` must be called when the application loads.

#### `modeler-validate`

This event is fired during validation, and can be used to add custom validation rules. See [Adding validation rules during runtime](#adding-validation-rules-during-runtime).

#### `modeler-change`

This event is fired anytime a change is made to the modeler that causes the underlying XML to change. This event is fired immediately after new state is pushed to the undo/redo stack.

```javascript
window.ProcessMaker.EventBus.$on('modeler-change', () => {
  console.log('The diagram has changed');
});
```

### Undo/redo store

The undo/redo feature is implemented using [Vuex](https://vuex.vuejs.org/), with the undo/redo Vuex store initialized in `src/undoRedoStore.js`. The undo/redo store keeps track of every change in the underlying BPMN XML, recording a copy of the XML string in a stack. Traversing the undo/redo stack simply uses the `loadXML` function to load the XML string from the current position in the stack.

### Validation

#### Adding a new lint rule

By default, the modeler automatically validates your diagram as you create it. This validation can be toggled on and off using the switch in the status bar. Validation is handled using https://github.com/bpmn-io/bpmnlint.

To add a new validation rule, create a new file in `processmaker-plugin/rules` named after your rule, for example, `node-id.js`. This file should export a function that returns an object with a `check` method. The `check` method will receive two arguments—`node` and `reporter`—and must return `undefined` if validation passes, or `reporter.report` to raise an error. For exmaple:

```javascript
// processmaker-plugin/rules/node-id.js

/**
 * Rule that checks node IDs start with "node_"
 */
module.exports = function() {
  function check(node, reporter) {
    if (typeof node.id === 'string' && !node.id.startsWith('node_')) {
      reporter.report(node.id, 'Node ID must start with the string "node_"');
    }
  }

  return { check };
};
```

When you are done writing the rule, add it to `processmaker-plugin/index.js`:

```javascript
module.exports = {
  configs: {
    all: {
      rules: {
        'processmaker/custom-validation': 'error',
        'processmaker/gateway-direction': 'error',
        'processmaker/node-id': 'error',
      },
    },
  },
};
```

For more examples, see the list of default rules at https://github.com/bpmn-io/bpmnlint/tree/master/rules.

#### Adding validation rules during runtime

To add custom validation when the linter runs, use the global event bus:
```javascript
window.ProcessMaker.EventBus.$on('modeler-validate', (node, reporter) => {
  if (typeof node.id === 'string' && !node.id.startsWith('node_')) {
    reporter.report(node.id, 'Node ID must start with the string "node_"');
  }
});
```

## Examples

### Adding a new component

Creating a new modeler component requires creating a Vue component, a component config, and calling the `registerNode` method to register your component.

First, create your component config, and save it in a `.js` file:

```javascript
// CustomComponentConfig.js

export default {
  // A unique ID that will be used to identify your component
  id: 'unique-custom-component-id',

  // A reference to the Vue component representing your component
  component: CustomComponent,

  // The bpmn type for your component, which will be used to save the component under in XML
  // It has the form prefix:name
  bpmnType: 'custom-namespace:CustomComponent',

  // A toggle to show/hide the component in the controls panel
  control: true,

  // The category to place the component under in the controls panel
  category: 'BPMN',

  // The icon representing the component in the controls panel
  icon: require('@/assets/toolpanel/scriptTask.svg'),

  // The label for the component in the controls panel
  label: 'Script Task',


  // The function used to create the BPMN definition object for the component in the XML
  // moddle is a reference to an instance of bpmn-moddle: https://github.com/bpmn-io/bpmn-moddle
  definition(moddle) {
    return moddle.create('bpmn:ScriptTask', {
      name: 'Script Task',
    });
  },

  // The function used to create the BPMN diagram object for the component in the XML
  // moddle is a reference to an instance of bpmn-moddle: https://github.com/bpmn-io/bpmn-moddle
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: taskHeight,
        width: 116,
      }),
    });
  },

  // The configuration for the inspector panel
  inspectorConfig: [
    {
      name: 'CustomComponent',
      items: [
        // Each item corresponds to a form element. 
        {
          // Component can be a custom Vue component or a reference to a form component from @processmaker/vue-form-elements
          component: 'FormText',
          config: {
            label: 'Custom Component Label',
            fontSize: '2em',
          },
        },
        // ...
      ],
    },
    // ...
  ],
};
```

Then, create a [Vue component](https://vuejs.org/v2/guide/components.html) for your custom element:

```vue
// CustomComponent.vue

<template>
  <div />
</template>

<script>
import Task from '@/components/nodes/task/task';

export default {
  extends: Task,
  mounted() {
    // Do things with this.shape
  },
};
</script>
```

Finally, register your custom component:

```javascript
registerNode(CustomComponentConfig);
```
