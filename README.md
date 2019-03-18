# Vue.js based BPMN modeler

[![CircleCI](https://circleci.com/gh/ProcessMaker/modeler.svg?style=svg)](https://circleci.com/gh/ProcessMaker/modeler)

`@processmaker/modeler` is a Vue.js based BPMN modeler scaffolded using [Vue CLI 3](https://cli.vuejs.org/).

- [Project setup](#project-setup)
- [Testing](#testing)
- [Architecture](#architecture)
  - [Global event bus](#global-event-bus)
    - [`modeler-init`](#modeler-init)
    - [`modeler-start`](#modeler-start)

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

# Create a production build of the app
npm run build

# Compile the app to be distributed as an npm package
npm run build-bundle

# Report and fix ESLint errors
npm run lint
```

## Testing

Tests are set up using Cypress. For more information, visit [https://cli.vuejs.org/config/#cypress](https://cli.vuejs.org/config/#cypress). Tests can be run locally with the following commands:

```bash
# Run the Cypress end-to-end (e2e) test suite
npm test

# Run the Cypress end-to-end (e2e) test suite in headless mode
npm run test-ci
```

Tests are run automatically on CircleCI when new branches are created and updated. The CI uses the `npm run test-ci` command to run tests.

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

This event is fired after the modeler has been set up and mounted. Listeners to this event are passed an object with a single  method, `loadXML`.

```javascript
window.ProcessMaker.EventBus.$on('modeler-start', ({ loadXML }) => {

  loadXML('<?xml version="1.0" encoding="UTF-8"?> ... </bpmn:definitions>');

});
```

For the modeler to function correctly, `loadXML` must be called when the application loads.
