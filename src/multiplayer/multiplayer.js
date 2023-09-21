import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { getNodeIdGenerator } from '../NodeIdGenerator';
import Room from './room';
export default class Multiplayer {
  ydoc = null;
  yarray = null;
  modeler = null;
  #nodeIdGenerator = null;
  room = null;
  deletedItem = null;
  constructor(modeler) {
    // define document
    this.ydoc = new Y.Doc();
    this.modeler = modeler;
    this.#nodeIdGenerator = getNodeIdGenerator(this.modeler.definitions);

    this.room = new Room(`room-${window.ProcessMaker.modeler.process.id}`);
    const wsProvider = new WebsocketProvider(process.env.VUE_APP_WEBSOCKET_PROVIDER, this.room.getRoom(), this.ydoc);
    wsProvider.on('status', () => {
      // todo status handler
    });

    // array of numbers which produce a sum
    this.yarray = this.ydoc.getArray('count');
    // observe changes of the diagram
    this.yarray.observe(event => {
      event.changes.delta.forEach((value) => {
        if (value.insert) {
          value.insert.forEach((value) => {
            this.createShape(value.toJSON());
            this.#nodeIdGenerator.updateCounters();
          });
        }
      });
      // remove nodes observer
      if (event.changes.deleted && event.changes.deleted.size > 0) {
        this.removeShape();
      }
    });
    this.yarray.observeDeep(ymapEventArray => {
      ymapEventArray.forEach((ymap) => {
        const ymapNested = ymap.target ;
        const newProperties = {};
        ymap.changes.keys.forEach((change, key) => {
          if (change.action === 'add') {
            // console.log(`Property "${key}" was added. Initial value: "${ymapNested.get(key)}".`);
            // TODO add new properties
          } else if (change.action === 'update') {
            // console.log(`Property "${key}" was updated. New value: "${ymapNested.get(key)}". Previous value: "${change.oldValue}".`);
            newProperties[key] = ymapNested.get(key);
          } else if (change.action === 'delete') {
            // TODO delete properties
            // console.log(`Property "${key}" was deleted. New value: undefined. Previous value: "${change.oldValue}".`);
          }
        });
        if (Object.keys(newProperties).length > 0 ) {
          newProperties['id'] = ymapNested.get('id');
          this.updateShapes(newProperties);
        }
      });
    });
    window.ProcessMaker.EventBus.$on('multiplayer-addNode', ( data ) => {
      this.addNode(data);
    });
    window.ProcessMaker.EventBus.$on('multiplayer-removeNode', ( data ) => {
      this.removeNode(data);
    });
    window.ProcessMaker.EventBus.$on('multiplayer-updateNodes', ( data ) => {
      this.updateNodes(data);
    });
  }
  addNode(data) {
    const ymapNested = new Y.Map();
    this.doTransact(ymapNested, data);
    this.yarray.push([ymapNested]);
  }
  createShape(value) {
    this.modeler.handleDropProcedure(value, false);
  }
  removeNode(data) {
    const index =  this.getIndex(data.definition.id);
    this.yarray.delete(index, 1); // delete one element 
  }
  getIndex(id) {
    let index = -1;
    for (const value of this.yarray) {
      index ++;
      if (value.get('id') === id) {
        break ;
      }
    }
    return index;
  }
  removeShape() {
    const nodes = this.getRemovedNodes(this.modeler.nodes, this.yarray.toArray());
    nodes.forEach((value) => {
      this.modeler.removeNodeProcedure(value, true);
    });
  }
  getRemovedNodes(array1, array2) {
    return array1.filter(object1 => {
      return !array2.some(object2 => {
        return object1.definition.id === object2.get('id');
      });
    });
  }
  updateNodes(data) {
    data.forEach((value) => {
      const index = this.getIndex(value.id);
      const nodeToUpdate =  this.yarray.get(index);
      this.doTransact(nodeToUpdate, value.properties);
    });
  }
  doTransact(ymapNested, data) {
    this.ydoc.transact(() => {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          ymapNested.set(key, data[key]);
        }
      }
    });
  }
  updateShapes(data) {
    const { paper } = this.modeler;
    const element = this.getJointElement(paper.model, data.id);
    // Update the element's position attribute
    element.set('position', { x:data.clientX, y:data.clientY });
    // Trigger a rendering of the element on the paper
    paper.findViewByModel(element).update();
  }
  getJointElement(graph, targetValue) {
    const cells = graph.getCells();
    for (const cell of cells) {
      if (cell.component.id === targetValue) {
        return cell;
      }
    }
    return null; // Return null if no matching element is found
  }
}
