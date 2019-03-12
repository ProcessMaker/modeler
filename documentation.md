# Bpmn Modeler Application

Bpmn Modeler is used to create Business Process Model and Notation(BPMN). The goal is to provides users a graphical notation for specifying Business Process Modeling while adhering to it's specifications. These diagrams are visualized with XML languages and designed for the execution of business processes.

- Bpmn Modeler is built using [vue-cli](https://cli.vuejs.org/)

- [JointJs]((https://www.jointjs.com/opensource) ) is used to create fully interactive BPMN processes

- [Cypress.io](https://docs.cypress.io/guides/overview/why-cypress.html#In-a-nutshell) for End-to-end tests

- [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle) allows the modeler to read and white BPMN 2.0 diagram files in NodeJS and the browser

## Architecture Description
- [Vuex](https://vuex.vuejs.org/) store serves as the centralized state management, our single source of truth

- Undo / Redo
    - Business processes are saved to an XML format and is used as the single source of truth
    - In addition to exporting the parsed XML, it is used for the undo / redo implementation
    - The application will listen to any changes to any node and will push a new state to the stack
    - Based on the position of the stack the application will know what XML state to load

- All `nodes` have two properties, diagram and definition
    - Diagram, defines how the node will render on the paper (Ex. height, width, x and y coordinates etc.)
    - Definition, creates the bpmn element that will eventually be converted to XML markup
- On highlight each node, has an inspector panel that renders its definitions and user are allowed to modify the definitions
- The form elements in the inspector panel are dynamically populated with [vue-form-builder](https://github.com/ProcessMaker/vue-form-builder)
- Business processes are validated with [bpmnlint](https://github.com/bpmn-io/bpmnlint) and allows for writing custom validation rules with non-bpmn elements

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

## Testing

Tests are set up using Cypress. For more information, visit [https://cli.vuejs.org/config/#cypress](https://cli.vuejs.org/config/#cypress).

### Run your end-to-end (e2e) headed tests

```
npm run test
```

### Run your end-to-end (e2e) headless tests

```
npm run test-ci
```
