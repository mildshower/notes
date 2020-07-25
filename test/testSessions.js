const assert = require('assert');
const Sessions = require('../src/sessions');

describe('Sessions', function() {
  describe('addSession', function() {
    it('should add a session of the given userName and return uniq session ID', function() {
      const sessions = new Sessions();
      assert(sessions.addSession('testUser'), '1');
    });
  });

  describe('getUserId', function() {
    it('should give userId if valid session Id is given', function() {
      const sessions = new Sessions();
      const sessionId = sessions.addSession('testUser');
      assert(sessions.getUserId(sessionId), 'testUser');
    });

    it('should give undefined if invalid session Id is given', function() {
      const sessions = new Sessions();
      assert.ok(!sessions.getUserId(123));
    });
  });

  describe('clearSession', function() {
    it('should clear the given sessionId', function() {
      const sessions = new Sessions();
      const id = sessions.addSession('testUser');
      sessions.clearSession(id);
      assert.ok(!sessions.getUserId(id));
    });
  });
});
