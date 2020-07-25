const sinon = require('sinon');
const { assert } = require('chai');
const DataStore = require('../src/dataStore');

describe('#getQuestionDetails', () => {
  it('it should give details of a question when valid id provided', (done) => {
    const dbClient = {
      get: sinon.fake.yields(null, { title: 'question' })
    };
    const dataStore = new DataStore(dbClient);
    dataStore.getQuestionDetails('1')
      .then(details => {
        assert.deepStrictEqual(details, { title: 'question' });
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.firstArg.match(/ques.id = 1/));
        done();
      });
  });
});

describe('#addNewUser', function() {
  const name = 'testUser';
  const avatarUrl = 'avatarUrl.com/u/58025792?v=4';
  const githubUrl = 'http://github.com/testUser';

  it('should add a new user to database', (done) => {
    const dbClient = {
      run: sinon.fake.yields(null, undefined)
    };
    const dataStore = new DataStore(dbClient);

    dataStore.addNewUser(name, avatarUrl, githubUrl)
      .then(actual => {
        assert.isUndefined(actual);
        assert.ok(dbClient.run.calledOnce);
        assert.ok(dbClient.run.firstArg.match(/"testUser"/));
        done();
      });
  });

  it('should not add a user when the user already present', (done) => {
    const dbClient = {
      run: sinon.fake.yields({
        message: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.github_username'
      }, null)
    };
    const dataStore = new DataStore(dbClient);

    const message = 'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.github_username';
    dataStore.addNewUser(name, avatarUrl, githubUrl)
      .catch(err => {
        assert.ok(dbClient.run.calledOnce);
        assert.ok(dbClient.run.firstArg.match(/"testUser"/));
        assert.equal(err.message, message);
        done();
      });
  });
});

describe('#getUser', function() {
  it('should get user details when the user is in present', (done) => {
    const details = {
      user: {
        github_username: 'testUser',
        avatar: 'avatarUrl.com/u/58025792?v=4',
        github_link: 'http://github.com/testUser',
        bio: null,
        display_name: 'USER',
        email: null,
        location: null,
        role: 'user',
        user_id: 4
      },
      isFound: true
    };

    const dbClient = {
      get: sinon.fake.yields(null, details.user)
    };
    const dataStore = new DataStore(dbClient);

    dataStore.getUser('github_username', 'testUser')
      .then(actual => {
        assert.deepStrictEqual(actual, details);
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.firstArg.match(/"testUser"/));
        done();
      });
  });

  it('should get user details undefined when the user is in not present', (done) => {
    const dbClient = {
      get: sinon.fake.yields(null, undefined)
    };
    const dataStore = new DataStore(dbClient);

    dataStore.getUser('github_username', 'noUser')
      .then(actual => {
        assert.deepStrictEqual(actual, { user: undefined, isFound: false });
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.firstArg.match(/github_username = "noUser";/));
        done();
      });
  });

  it('Should give error if we given key is not present', (done) => {
    const dbClient = {
      get: sinon.fake.yields({
        message: 'no such column: github_user'
      }, null)
    };
    const dataStore = new DataStore(dbClient);

    const message = 'no such column: github_user';
    dataStore.getUser('github_user', 'noUser')
      .catch(err => {
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.firstArg.match(/github_user = "noUser";/));
        assert.equal(err.message, message);
        done();
      });
  });
});

describe('#updateUserDetails', function() {
  const name = 'testUser';
  const email = 'testUser.com';
  const location = 'Bangalore';

  it('should update details of a user to database', (done) => {
    const dbClient = {
      run: sinon.fake.yields(null, undefined)
    };
    const dataStore = new DataStore(dbClient);

    dataStore.updateUserDetails(4, name, email, location)
      .then(actual => {
        assert.isUndefined(actual);
        assert.ok(dbClient.run.calledOnce);
        assert.ok(dbClient.run.firstArg.match(/email = "testUser.com",/));
        done();
      });
  });
});
