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
    this.clientIO = io(process.env.VUE_APP_WEBSOCKET_PROVIDER, { transports: ['websocket', 'polling']});

    this.clientIO.on('connect', () => {
      // Join the room
      this.clientIO.emit('joinRoom', this.room.getRoom());
    });

    // Listen for updates when a new element is added
    this.clientIO.on('createElement', async(payload) => {
      // Create the new element in the process
      await this.createRemoteShape(payload.changes);
      // Add the new element to the shared array
      Y.applyUpdate(this.yDoc, new Uint8Array(payload.updateDoc));
    });

    // Listen for updates when an element is removed
    this.clientIO.on('removeElement', (payload) => {
      // Get the node id
      const node = this.getNodeById(payload.nodeId);
      // Remove the element from the process
      this.removeShape(node);
      // Remove the element from the shared array
      Y.applyUpdate(this.yDoc, new Uint8Array(payload.updateDoc));
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
  createRemoteShape(changes) {
    return new Promise(resolve => {
      changes.map((data) => {
        this.createShape(data);
      });

      resolve();
    });
  }
  removeNode(data) {
    const index =  this.getIndex(data.definition);
    this.removeShape(data);
    this.yArray.delete(index, 1); // delete one element

    // Encode the state as an update and send it to the server
    const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
    // Send the update to the web socket server
    this.clientIO.emit('removeElement', stateUpdate);
  }
  getIndex(definition) {
    let index = -1;
    for (const value of this.yArray) {
      index ++;
      if (value.id === definition.id) {
        break ;
      }
    }
    return index;
  }
  getNodeById(nodeId) {
    const node = this.modeler.nodes.find((element) => element.definition && element.definition.id === nodeId);

    return node;
  }
  removeShape(node) {
    this.modeler.removeNodeProcedure(node, true);
  }
}
