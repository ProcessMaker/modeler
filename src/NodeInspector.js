import NodeIdGenerator from './NodeIdGenerator';
import omit from 'lodash/omit';

export default class NodeInspector {

  constructor(definitions, options = {}) {
    this.index = window.NODE_INSPECTOR_FIRST_INDEX || new Date().getTime();
    this.definitions = definitions;
    this.nodeIdGenerator = new NodeIdGenerator(this.definitions);
    this.options = Object.assign({
      prefix: this.nodeIdGenerator.generate()[0],
    }, options);
    this.createdModdleNodes = {};
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
          obj[key] = node[key].filter(item => item).map(item => item.id);
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
          if (val!== null && val !== undefined) {
            obj[prop] = val;
          } else if (val === undefined) {
            delete obj[prop];
          }
          return obj;
        }, node || this.createModdleNode(moddle, value));
      } catch (e) {
        throw `Unable to create moddle node of type "${value.$type}" \n ${e}`;
      }
    }
    
    if (node && key !== undefined && value !== undefined && value !== null) {
      node[key] = value;
    }

    return value;
  }

  createModdleNode(moddle, value) {
    const node = moddle.create(value.$type, { id: this.generateId() });
    if (value.id) {
      this.createdModdleNodes[value.id] = node;
    }
    return node;
  }

  setReferences(value, key = null) {
    if (value === undefined) return;

    if (this.isReference(key)) {
      value = value instanceof Array ? value.map(id => this.findReference(id)) : this.findReference(value);

    } else if (value instanceof Array) {
      value = value.map(item => this.setReferences(item, null));

    } else if (value instanceof Object) {
      Object.keys(omit(value, '$type', '$config', 'markerFlags')).forEach(key => {
        value[key] = this.setReferences(value[key], key);
      });
    } 

    return value;
  }

  isReference(key)
  {
    return !!key && (key.substr(key.length-3) === 'Ref' || key.substr(key.length-4) === 'Refs');
  }

  findReference(id)
  {
    return this.createdModdleNodes[id] || this.findById(id);
  }

  generateId() {
    this.index++;
    return `${this.options.prefix}_${this.index}`;
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
