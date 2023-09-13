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
  constructor(modeler) {
    // define document
    this.ydoc = new Y.Doc();
    this.modeler = modeler;
    this.#nodeIdGenerator = getNodeIdGenerator(this.definitions);

    this.room = new Room('room-' + window.ProcessMaker.modeler.process.id);
    const wsProvider = new WebsocketProvider('ws://localhost:1234', this.room.getRoom(), this.ydoc);
    wsProvider.on('status', event => {
      console.log(event.status); // logs "connected" or "disconnected"
    });

    // array of numbers which produce a sum
    this.yarray = this.ydoc.getArray('count');
    // observe changes of the diagram
    this.yarray.observe(event => {
      event.changes.delta.forEach((value) =>{
        if (value.insert) {
          value.insert.forEach((value) => {
            console.log(value);
            this.createShape(value);
            this.#nodeIdGenerator.updateCounters();
          });
        }
      });
    });
  }
  addNode(data) {
    console.log(data);
    this.yarray.push([data]);
 
  }
  removeNode(id) {
    console.log(id);
    // TODO REMOVE  A NODE
  }
  createShape(value) {
    // todo create a chape
    this.modeler.handleDrop2(value, false);

  }
}
