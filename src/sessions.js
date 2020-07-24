class Sessions {
  constructor() {
    this.sessions = {};
    this.lastId = 1;
  }

  addSession(userId) {
    const sessionId = this.lastId++;
    this.sessions[sessionId] = userId;
    return sessionId;
  }

  getUserId(sessionId) {
    return this.sessions[sessionId];
  }

  clearSession(id) {
    delete this.sessions[id];
  }
}

module.exports = { Sessions }