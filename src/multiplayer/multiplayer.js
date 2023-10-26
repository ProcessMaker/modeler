import { io } from 'socket.io-client';
import * as Y from 'yjs';
import { getNodeIdGenerator } from '../NodeIdGenerator';
import { getDefaultAnchorPoint } from '@/portsUtils';
import Room from './room';
import store from '@/store';

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
  }
  init() {
    // Get the node id generator
    this.#nodeIdGenerator = getNodeIdGenerator(this.modeler.definitions);
    // Get the room name from the process id
    const processId = window.ProcessMaker.modeler.process.uuid ?? window.ProcessMaker.modeler.process.id;
    this.room = new Room(`room-${processId}`);

    // Connect to websocket server
    this.clientIO = io(window.ProcessMaker.multiplayer.host, { transports: ['websocket', 'polling']});

    this.clientIO.on('connect', () => {
      // Join the room
      this.clientIO.emit('joinRoom', {
        roomName: this.room.getRoom(),
        clientName: window.ProcessMaker.user?.fullName,
        clientAvatar: window.ProcessMaker.user?.avatar,
      });
    });

    this.clientIO.on('clientJoined', (payload) => {
      this.modeler.enableMultiplayer(payload.isMultiplayer);

      if (payload.isMultiplayer) {
        payload.clients.map(client => {
          const newPlayer = {
            id: client.id,
            name: client.name,
            color: '#FF6F61',
            avatar: client.avatar,
            top: 90,
            left: 80,
          };

          this.modeler.addPlayer(newPlayer);
        });
      }
    });

    this.clientIO.on('clientLeft', (payload) => {
      // Remove the player from the multiplayer list
      this.modeler.removePlayer(payload.clientId);

      this.modeler.enableMultiplayer(payload.isMultiplayer);
    });

    this.clientIO.on('requestProcess', (payload) => {
      const { firstClient, clientId } = payload;

      // Check if the current client is the first client
      if (firstClient.id === this.clientIO.id) {
        // Get the process definition
        const nodes = this.modeler.nodes.map((node) => this.modeler.multiplayerHook(node, false, true));

        nodes.forEach((node) => {
          const yMapNested = new Y.Map();
          this.doTransact(yMapNested, node);
          this.yArray.push([yMapNested]);
          // Encode the state as an update and send it to the server
          const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
          // Send the update to the web socket server
          this.clientIO.emit('createElement', { updateDoc: stateUpdate, clientId });
        });
      }
    });

    // Listen for updates when a new element is added
    this.clientIO.on('createElement', async(payload) => {
      // Create the new element in the process
      await this.createRemoteShape(payload.changes);
      // Add the new element to the shared array
      Y.applyUpdate(this.yDoc, new Uint8Array(payload.updateDoc));
    });

    // Listen for updates when a new element is requested
    this.clientIO.on('createRequestedElement', async(payload) => {
      if (payload.clientId === this.clientIO.id) {
        // Create the new element in the process
        await this.createRemoteShape(payload.changes);
        // Add the new element to the shared array
        Y.applyUpdate(this.yDoc, new Uint8Array(payload.updateDoc));
      }
    });

    // Listen for updates when an element is removed
    this.clientIO.on('removeElement', (payload) => {
      payload.deletedNodes.forEach(nodeId => {
        // Get the node id
        const node = this.getNodeById(nodeId);
        // Remove the element from the process
        this.removeShape(node);
      });
      // Remove the element from the shared array
      Y.applyUpdate(this.yDoc, new Uint8Array(payload.updateDoc));
    });

    // Listen for updates when a element is updated
    this.clientIO.on('updateElement', (payload) => {
      const { updateDoc, updatedNodes, isReplaced } = payload;

      if (isReplaced) {
        // Replace the element in the process
        this.replaceShape(updatedNodes[0]);
      } else {
        // Update the elements in the process
        updatedNodes.forEach((data) => {
          this.updateShapes(data);
        });
      }

      // Update the element in the shared array
      Y.applyUpdate(this.yDoc, new Uint8Array(updateDoc));
    });

    this.clientIO.on('updateInspector', (payload) => {
      const { updateDoc, updatedNodes } = payload;

      // Update the elements in the process
      updatedNodes.forEach((data) => {
        this.updateShapeFromInspector(data);
      });

      // Update the element in the shared array
      Y.applyUpdate(this.yDoc, new Uint8Array(updateDoc));
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

    window.ProcessMaker.EventBus.$on('multiplayer-replaceNode', ({ nodeData, newControl }) => {
      this.replaceNode(nodeData, newControl);
    });

    window.ProcessMaker.EventBus.$on('multiplayer-addFlow', ( data ) => {
      this.addCommonElement(data);
    });

    window.ProcessMaker.EventBus.$on('multiplayer-addBoundaryEvent', ( data ) => {
      this.addCommonElement(data);
    });

    window.ProcessMaker.EventBus.$on('multiplayer-addLanes', ( lanes ) => {
      this.addLaneNodes(lanes);
    });
    window.ProcessMaker.EventBus.$on('multiplayer-updateInspectorProperty', ( data ) => {
      if (this.modeler.isMultiplayer) {
        this.updateInspectorProperty(data);
      }
    });
  }
  addNode(data) {
    // Add the new element to the shared array
    const yMapNested = new Y.Map();
    this.doTransact(yMapNested, data);
    this.yArray.push([yMapNested]);
    // Encode the state as an update and send it to the server
    const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
    // Send the update to the web socket server
    this.clientIO.emit('createElement', { updateDoc: stateUpdate });
  }
  createShape(value){
    if (this.modeler.nodeRegistry[value.type] && this.modeler.nodeRegistry[value.type].multiplayerClient) {
      this.modeler.nodeRegistry[value.type].multiplayerClient(this.modeler, value);
    } else {
      this.modeler.addRemoteNode(value);
    }
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
    const index =  this.getIndex(data.definition.id);
    if (index >= 0) {
      this.removeShape(data);
      this.yArray.delete(index, 1); // delete one element
      // Encode the state as an update and send it to the server
      const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
      // Send the update to the web socket server
      this.clientIO.emit('removeElement', stateUpdate);
    }
  }
  getIndex(id) {
    let index = -1;
    let found = false;
    for (const value of this.yArray) {
      index ++;
      if (value.get('id') === id) {
        found = true;
        break ;
      }
    }
    return found ? index : -1;
  }
  getNodeById(nodeId) {
    const node = this.modeler.nodes.find((element) => element.definition && element.definition.id === nodeId);

    return node;
  }
  removeShape(node) {
    this.modeler.removeNodeProcedure(node, true);
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
      const nodeToUpdate =  this.yArray.get(index);
      const updateData = value.poolId ? { ...value.properties, ...{ poolId: value.poolId } } : value.properties;
      this.doTransact(nodeToUpdate, updateData);
    });
  }
  replaceNode(nodeData, newControl) {
    // Get the node to update
    const index = this.getIndex(nodeData.nodeThatWillBeReplaced.definition.id);
    const nodeToUpdate =  this.yArray.get(index);

    // Update the node id in the nodeData
    nodeData.id = `node_${this.#nodeIdGenerator.getDefinitionNumber()}`;
    // Update the node id generator
    this.#nodeIdGenerator.updateCounters();
    this.replaceShape({
      oldNodeId: nodeData.nodeThatWillBeReplaced.definition.id,
      id: nodeData.id,
      type: newControl,
      x: nodeData.x,
      y: nodeData.y,
    });
    // Update the node in the shared array
    this.yDoc.transact(() => {
      nodeToUpdate.set('type', newControl);
      nodeToUpdate.set('id', nodeData.id);
    });

    // Encode the state as an update and send it to the server
    const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
    this.clientIO.emit('updateElement', { updateDoc: stateUpdate, isReplaced: true });
  }
  replaceShape(updatedNode) {
    const { x: clientX, y: clientY } = this.modeler.paper.localToClientPoint(updatedNode);
    // Get the node to update
    const node = this.getNodeById(updatedNode.oldNodeId);
    // Update the node id in the nodeData
    const nodeData = {
      clientX,
      clientY,
      control: { type: updatedNode.type },
      nodeThatWillBeReplaced: node,
      color: node.color,
      id: updatedNode.id,
    };

    // Replace the node in the process
    this.modeler.replaceNodeProcedure(nodeData, true);
    this.#nodeIdGenerator.updateCounters();
  }
  doTransact(yMapNested, data) {
    this.yDoc.transact(() => {
      for (const key in data) {
        if (Object.hasOwn(data, key)) {
          yMapNested.set(key, data[key]);
        }
      }
    });

    // Encode the state as an update and send it to the server
    const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
    // Send the update to the web socket server
    this.clientIO.emit('updateElement', { updateDoc: stateUpdate, isReplaced: false });
  }
  async updateShapes(data) {
    const { paper } = this.modeler;
    const element = this.modeler.getElementByNodeId(data.id);
    const newPool = this.modeler.getElementByNodeId(data.poolId);

    if (this.modeler.flowTypes.includes(data.type)) {
      // Update the element's waypoints
      // Get the source and target elements
      const sourceElem = this.modeler.getElementByNodeId(data.sourceRefId);
      const targetElem = this.modeler.getElementByNodeId(data.targetRefId);

      const { waypoint } = data;
      const startWaypoint = waypoint.shift();
      const endWaypoint = waypoint.pop();

      // Update the element's waypoints
      const newWaypoint = waypoint.map(point => this.modeler.moddle.create('dc:Point', point));
      element.set('vertices', newWaypoint);

      // Update the element's source anchor
      element.source(sourceElem, {
        anchor: () => {
          return getDefaultAnchorPoint(this.getConnectionPoint(sourceElem, startWaypoint), sourceElem.findView(paper));
        },
        connectionPoint: { name: 'boundary' },
      });

      // Update the element's target anchor
      element.target(targetElem, {
        anchor: () => {
          return getDefaultAnchorPoint(this.getConnectionPoint(targetElem, endWaypoint), targetElem.findView(paper));
        },
        connectionPoint: { name: 'boundary' },
      });
    } else {
      // Update the element's position attribute
      element.resize(
        /* Add labelWidth to ensure elements don't overlap with the pool label */
        data.width,
        data.height,
      );
      element.set('position', { x: data.x, y: data.y });

      const node = this.getNodeById(data.id);
      store.commit('updateNodeProp', { node, key: 'color', value: data.color });

      // boundary type
      if (element.component.node.definition.$type === 'bpmn:BoundaryEvent') {
        this.attachBoundaryEventToNode(element, data);
      }

      // Trigger a rendering of the element on the paper
      await paper.findViewByModel(element).update();
      // validate if the parent pool was updated
      await element.component.$nextTick();
      await this.modeler.paperManager.awaitScheduledUpdates();
      if (newPool && element.component.node.pool && element.component.node.pool.component.id !== data.poolId) {
        element.component.node.pool.component.moveElementRemote(element, newPool);
      }
    }
  }
  attachBoundaryEventToNode(element, data) {
    const node = this.getNodeById(data.attachedToRefId);

    // Find previous attached task
    const previousAttachedTask = element.getParentCell();

    // Find new attached task
    const newAttachedTask = this.modeler.getElementByNodeId(data.attachedToRefId);

    if (previousAttachedTask) {
      previousAttachedTask.unembed(element);
    }

    if (newAttachedTask) {
      newAttachedTask.embed(element);
    }

    element.component.node.definition.set('attachedToRef', node.definition);
  }
  addCommonElement(data) {
    // Add a new flow / boundary event to the shared array
    const yMapNested = new Y.Map();
    this.doTransact(yMapNested, data);
    this.yArray.push([yMapNested]);
    // Encode the state as an update and send it to the server
    const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
    // Send the update to the web socket server
    this.clientIO.emit('createElement', { updateDoc: stateUpdate });
    this.#nodeIdGenerator.updateCounters();
  }
  addLaneNodes(lanes) {
    const pool = this.getPool(lanes);
    window.ProcessMaker.EventBus.$emit('multiplayer-updateNodes', [{
      id: pool.component.node.definition.id,
      properties: {
        x: pool.component.node.diagram.bounds.x,
        y: pool.component.node.diagram.bounds.y,
        height: pool.component.node.diagram.bounds.height,
        width: pool.component.node.diagram.bounds.width,
        isAddingLaneAbove: pool.isAddingLaneAbove,
      },
    }]);
    this.yDoc.transact(() => {
      lanes.forEach((lane) => {
        const yMapNested = new Y.Map();
        const data = this.prepareLaneData(lane);
        this.doTransact(yMapNested, data);
        this.yArray.push([yMapNested]);
        const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
        this.clientIO.emit('createElement', { updateDoc: stateUpdate });
      });
    });
  }
  prepareLaneData(lane) {
    const data = {
      type: lane.type,
      id: lane.definition.id,
      name: lane.definition.name,
      x: lane.diagram.bounds.x,
      y: lane.diagram.bounds.y,
      width: lane.diagram.bounds.width,
      height: lane.diagram.bounds.height,
      poolId: lane.pool.component.node.definition.id,
      laneSetId: lane.pool.component.laneSet.id,
    };
    return data;
  }
  getPool(lanes) {
    if (lanes && lanes.length > 0) {
      return lanes[0].pool;
    }
    return false;
  }
  getConnectionPoint(element, newPosition) {
    const { x: elemX, y: elemY } = element.position();
    const connectionOffset = {
      x: newPosition.x - elemX,
      y: newPosition.y - elemY,
    };

    const { x, y } = element.position();
    const { width, height } = element.size();

    return connectionOffset
      ? { x: x + connectionOffset.x, y: y + connectionOffset.y }
      : { x: x + (width / 2), y: y + (height / 2) };
  }
  updateInspectorProperty(data) {
    const index = this.getIndex(data.id);
    const nodeToUpdate =  this.yArray.get(index);

    if (nodeToUpdate) {
      let newValue = data.value;
      if (data.key === 'loopCharacteristics') {
        newValue = JSON.stringify(data.value);
      }
      nodeToUpdate.set(data.key, newValue);

      const stateUpdate = Y.encodeStateAsUpdate(this.yDoc);
      // Send the update to the web socket server
      this.clientIO.emit('updateFromInspector', { updateDoc: stateUpdate, isReplaced: false });
    }
  }
  setNodeProp(node, key, value) {
    store.commit('updateNodeProp', { node, key, value });
  }
  updateShapeFromInspector(data) {
    let node = null;
    if (data.oldNodeId && data.oldNodeId !== data.id) {
      const index = this.getIndex(data.oldNodeId);
      const yNode =  this.yArray.get(index);
      yNode.set('id', data.id);
      node = this.getNodeById(data.oldNodeId);
      store.commit('updateNodeProp', { node, key: 'id', value: data.id });
      return;
    }
    // create a node
    node = this.getNodeById(data.id);

    if (node) {
      // loopCharacteristics property section
      if (data.loopCharacteristics) {
        const loopCharacteristics = JSON.parse(data.loopCharacteristics);
        this.modeler.nodeRegistry[node.type].loopCharacteristicsHandler({
          type: node.definition.type,
          '$loopCharactetistics': {
            id: data.id,
            loopCharacteristics,
          },
        }, node, this.setNodeProp, this.modeler.moddle, this.modeler.definitions, false);
        return;
      }

      const keys = Object.keys(data).filter((key) => key !== 'id');

      if (keys[0] === 'condition') {
        node.definition.get('eventDefinitions')[0].get('condition').body = data[keys[0]];
      }

      if (keys[0] === 'gatewayDirection') {
        node.definition.set('gatewayDirection', data[keys[0]]);
      }

      store.commit('updateNodeProp', { node, key:keys[0], value: data[keys[0]] });
    }

  }
}
