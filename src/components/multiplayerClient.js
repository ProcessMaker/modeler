import { io } from 'socket.io-client';
import * as Automerge from '@automerge/automerge';

export default class multiplayerClient {
  open = false;
  syncState;
  client;
  documentId;
  document;

  constructor(documentId, document, publish = false) {
    this.document = document || {};

    if (publish) {
      this.documentId = documentId;
    } else {
      documentId = 'test1';
    } 

    this.syncState = Automerge.initSyncState();
    this.client = this._createClient();
  }

  _createClient() {
    this.client = io(import.meta.env.VITE_WS_URL);

    this.client.on('connect', () => {
      console.log('########################');
      console.log('connected', this.client.id);
    });
    return this.client;
  }

  localChange(newDoc) {
    this.document = newDoc;
    if (!this.open) {
      this.once('open', () => this.updatePeers());
      return;
    }
    this.updatePeers();
  }

  updatePeers() {
    let [nextSyncState, msg] = Automerge.generateSyncMessage(
      this.document,
      this.syncState,
    );
    this.syncState = nextSyncState;
    if (msg) {
      console.log('sending sync msg');
      this.client.send(msg);
    } else {
      console.log('no sync message to send');
    }
  }
  close() {
    console.log('Websocket client closed.');
    this.client.close();
  }
  on(event, cb) {
    this.client.on(event, cb);
  }
  emit(event, payload) {
    this.client.emit(event, payload);
  }
}
