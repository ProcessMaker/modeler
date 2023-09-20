import { io } from 'socket.io-client';
import * as Y from 'yjs';
import { getNodeIdGenerator } from '../NodeIdGenerator';
import Room from './room';
export default class Multiplayer {
  clientIO = null;
  yDoc = null;
  yArray = null;
  modeler = null;
  #nodeIdGenerator = null;
  room = null;
  deletedItem = null;
  constructor(modeler) {
    // define document
    this.yDoc = new Y.Doc();
    // Create a shared array
    this.yArray = this.yDoc.getArray('elements');
    // Create a Modeler instance
    this.modeler = modeler;
    // Get the node id generator
    this.#nodeIdGenerator = getNodeIdGenerator(this.modeler.definitions);
    // Get the room name from the process id
    this.room = new Room(`room-${window.ProcessMaker.modeler.process.id}`);

    // Connect to websocket server
    this.clientIO = io('ws://127.0.0.1:3000', { transports: ['websocket', 'polling']});

    this.clientIO.on('connect', () => {
      // console.log('########################');
      // console.log('connected', this.clientIO.id);

      // Join the room
      this.clientIO.emit('joinRoom', this.room.getRoom());
    });

    // Listen for updates when a new element is added
    this.clientIO.on('createElement', (messages) => {
      // console.log('########################');
      // console.log('received', messages);

      // Add the new element to the process
      messages.map((data) => {
        this.createShape(data);
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
    // Add the new element to the process
    this.createShape(data);
    // Add the new element to the shared array
    this.yArray.push([data]);
    // Encode the state as an update and send it to the server
    const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
    // Send the update to the web socket server
    this.clientIO.emit('createElement', stateUpdate);
  }
  createShape(value) {
    this.modeler.handleDropProcedure(value, false);
    this.#nodeIdGenerator.updateCounters();
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
