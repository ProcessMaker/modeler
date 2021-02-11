import NodeIdGenerator from './NodeIdGenerator';
import omit from 'lodash/omit';

export default class NodeInspector {

  constructor(definitions) {
    this.index = 0;
    this.definitions = definitions;
    this.nodeIdGenerator = new NodeIdGenerator(this.definitions);
  }

  getDefinitionProps(node) {
    if (node instanceof Array) {
      return node.map(item => this.getDefinitionProps(item));
    } else if (node instanceof Object) {
      return Object.getOwnPropertyNames(node).reduce((obj, key) => {
        if (node[key] instanceof Function) return obj;
        const isReference = (key.substr(key.length-3) === 'Ref' || key.substr(key.length-4) === 'Refs');
        if (node[key] instanceof Object && node[key].id && isReference) {
          obj[key] = Object && node[key].id;
        } else if (node[key] instanceof Array && isReference) {
          obj[key] = node[key].map(item => item.id);
        } else if (key === '$type' || (key.substr(0,1) !== '$' && key.substr(0,2) !== '__')) {
          obj[key] = this.getDefinitionProps(node[key]);
        }
        return obj;
      }, {});
    } else {
      return node;
    }
  }
  
  setDefinitionProps(value, setNodeProp, moddle, node, key) {
    if (value === undefined) return;
    if (value instanceof Array) {
      value = value.map(item => this.setDefinitionProps(item, setNodeProp, moddle));
    } else if (value instanceof Object) {
      try {
        value = Object.keys(omit(value, '$type', '$config', 'markerFlags')).reduce((obj, prop) => {
          const val = this.setDefinitionProps(value[prop], setNodeProp, moddle, undefined, prop);
          obj[prop] = val;
          return obj;
        }, node || moddle.create(value.$type, { id: this.generateId() }));
      } catch (e) {
        throw `Unable to create moddle node of type "${value.$type}" \n ${e}`;
      }
    }
    const isReference = key !== undefined && (key.substr(key.length-3) === 'Ref' || key.substr(key.length-4) === 'Refs');
    if (isReference) {
      value = value instanceof Array ? value.map(id => this.findById(id)) : this.findById(value);
    }
    if (node && key !== undefined && value !== undefined) {
      node[key] = value;
    }
    return value;
  }

  generateId() {
    this.index++;
    return `${this.nodeIdGenerator.generate()[0]}_${this.index}`;
  }

  findById(id, root = this.definitions.rootElements, walked = []) {
    if (walked.indexOf(root) > -1) return;
    let found;
    if (root instanceof Array) {
      walked.push(root);
      root.find(item => found = this.findById(id, item, walked));
    } else if (root instanceof Object && root.$type) {
      walked.push(root);
      if (root.id === id) return root;
      Object.getOwnPropertyNames(root).find(key => found = !(root[key] instanceof Function) && this.findById(id, root[key], walked));
    }
    return found;
  }
}
