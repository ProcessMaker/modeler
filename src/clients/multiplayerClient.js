import { io } from 'socket.io-client';

export default class MultiplayerClient {
  client
  constructor() {
    this.client = this._createClient();
  }
  _createClient() {
    this.client = io('localhost:3000');
    this.client.on('connect', () => {
      console.log('########################');
      console.log('connected', this.client.id);
    });
    return this.client;
  }
  close() {
    console.log('Websocket client closed.');
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