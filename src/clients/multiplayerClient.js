import { io } from 'socket.io-client';

export default class MultiplayerClient {
  client
  ENDPOINT = 'localhost:3000'
  constructor() {
    this.client = this._createClient();
  }
  _createClient() {
    this.client = io(this.ENDPOINT);
    this.client.on('connect', () => {
      //TODO connect logic
    });
    return this.client;
  }
  close() {
    this.client.close();
  }
  addEventListener(event) {
    if (!this.client) {
      this._createClient();
    }
  
    this.client.on(event.type, event.callback);
  }
  sendEvent(event) {
    this.client.emit(event.type, event.data);
  }
}