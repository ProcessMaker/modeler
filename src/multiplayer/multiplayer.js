import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';
import { getNodeIdGenerator } from '../NodeIdGenerator';
import Room from './room';
import { io } from 'socket.io-client';
export default class Multiplayer {
  yDoc = null;
  yArray = null;
  modeler = null;
  #nodeIdGenerator = null;
  room = null;

  constructor(modeler) {
    // define document
    this.yDoc = new Y.Doc();
    this.yArray = this.yDoc.getArray('elements');
    this.modeler = modeler;
    this.#nodeIdGenerator = getNodeIdGenerator(this.definitions);

    this.room = new Room('room-' + window.ProcessMaker.modeler.process.id);

    this.client = io('ws://127.0.0.1:3000', { transports: ['websocket', 'polling']});

    this.client.on('connect', () => {
      console.log('########################');
      console.log('connected', this.client.id);

      this.client.emit('joinRoom', this.room.getRoom());
    });

    this.client.on('createElement', (messages) => {
      console.log('########################');
      console.log('received', messages);

      messages.map((message) => {
        this.createShape(message);
        this.#nodeIdGenerator.updateCounters();
      });
    });


    /* const wsProvider = new WebsocketProvider('ws://localhost:1234', this.room.getRoom(), this.ydoc);
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
    }); */
  }
  addNode(data) {
    this.modeler.handleDrop2(data, false);
    this.#nodeIdGenerator.updateCounters();

    this.yArray.push([data]);
    const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);

    // this.client.emit('elementCreate', data);
    this.client.emit('elementStateUpdate', stateUpdate);
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
