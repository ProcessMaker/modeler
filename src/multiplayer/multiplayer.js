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
            this.createShape(value);
            this.#nodeIdGenerator.updateCounters();
          });
        }
      });
      // remove nodes observer
      event.changes.deleted.forEach((value)=>{
        if (value.content && value.content.arr) {
          this.removeShape(value.content.arr[0].id);
        }
      });
    });
    window.ProcessMaker.EventBus.$on('multiplayer-addNode', ( data ) => {
      this.addNode(data);
    });
    window.ProcessMaker.EventBus.$on('multiplayer-removeNode', ( data ) => {
      this.removeNode(data);
    });
  }
  addNode(data) {
    this.yarray.push([data]);
  }
  createShape(value) {
    this.modeler.handleDropProcedure(value, false);
  }
  removeNode(data) {
    const index =  this.getIndex(data.definition);
    this.yarray.delete(index, 1); // delete one element 
  }
  getIndex(definition) {
    let index = -1;
    for (const value of this.yarray) {
      index ++;
      if (value.id === definition.id) {
        break ;
      }
    }
    return index;
  }
  removeShape(nodeId) {
    const node = this.modeler.nodes.find((element) => element.definition && element.definition.id === nodeId);
    this.modeler.removeNodeProcedure(node, true);
  }
}
