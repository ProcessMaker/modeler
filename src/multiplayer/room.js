export default class Room {
  #room ='';
  constructor(name) {
    this.#room = name;
  }
  getRoom() {
    return this.#room;
  }
}