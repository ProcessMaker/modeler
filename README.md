# Vue.js based BPMN modeler

[![CircleCI](https://circleci.com/gh/ProcessMaker/modeler.svg?style=svg)](https://circleci.com/gh/ProcessMaker/modeler)

`@processmaker/modeler` is a Vue.js based BPMN modeler scaffolded using [Vue CLI 3](https://cli.vuejs.org/).

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

# Report and fixe ESLint errors
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

#### `modeler-start`