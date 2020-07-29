const sinon = require('sinon');
const { assert } = require('chai');
const DataStore = require('../src/dataStore');

context('dataStore', () => {
  context('#getQuestionDetails', () => {
    it('it should give details of question when valid id provided', (done) => {
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

    it('it should produce error when invalid id is given', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, undefined)
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getQuestionDetails('2')
        .catch(error => {
          assert.deepStrictEqual(error.message, 'Wrong Id Provided');
          assert.ok(dbClient.get.calledOnce);
          assert.ok(dbClient.get.firstArg.match(/ques.id = 2/));
          done();
        });
    });
  });

  context('#init', () => {
    it('it should run database initiation sql', (done) => {
      const dbClient = {
        exec: sinon.fake.yields()
      };
      const dataStore = new DataStore(dbClient);
      dataStore.init()
        .then(() => {
          assert.ok(dbClient.exec.calledOnce);
          assert.ok(dbClient.exec.firstArg.match(/PRAGMA foreign_keys=ON/));
          done();
        });
    });
  });

  context('#getLastQuestions', () => {

    it('it should give last question id\'s if valid count is given', (done) => {
      const dbClient = {
        all: sinon.fake.yields(null, [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getLastQuestions(2)
        .then(questionIds => {
          assert.deepStrictEqual(questionIds, [{ id: 1 }, { id: 2 }]);
          assert.ok(dbClient.all.calledOnce);
          assert.ok(dbClient.all.firstArg.match(/order by ques\.created DESC/));
          done();
        });
    });

    it('it should produce error when invalid count is provided', (done) => {
      const dbClient = {
        all: sinon.fake.yields(null, [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }])
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getLastQuestions(-1)
        .catch(error => {
          assert.deepStrictEqual(error.message, 'Negative count error!');
          assert.ok(dbClient.all.calledOnce);
          assert.ok(dbClient.all.firstArg.match(/order by ques\.created DESC/));
          done();
        });
    });
  });

  context('#addQuestion', () => {

    it('it should add a question when valid owner given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
        get: sinon.fake.yields(null, { id: 1 }),
        serialize: (cb) => cb()
      };
      const dataStore = new DataStore(dbClient);
      dataStore.addQuestion({ title: 'title', body: 'body', body_text: 'body' }, 1)
        .then(details => {
          assert.deepStrictEqual(details, { id: 1 });
          assert.ok(dbClient.run.calledOnce);
          assert.ok(dbClient.get.calledOnce);
          done();
        });
    });

    it('it should produce error if wrong owner is given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error()),
        get: sinon.fake.yields(null, { id: 1 }),
        serialize: (cb) => cb()
      };
      const dataStore = new DataStore(dbClient);
      dataStore.addQuestion({ title: 'title', body: 'body', body_text: 'body' }, 10)
        .catch(err => {
          assert.deepStrictEqual(err.message, 'Question Insertion Incomplete!');
          done();
        });
    });
  });

  context('#addNewUser', function() {
    const name = 'testUser';
    const avatarUrl = 'avatarUrl.com/u/58025792?v=4';
    const githubUrl = 'http://github.com/testUser';

    it('should add a new user to database', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
        get: sinon.fake.yields(null, {id: 1}),
        serialize: (cb) => cb()
      };
      const dataStore = new DataStore(dbClient);

      dataStore.addNewUser(name, avatarUrl, githubUrl)
        .then(actual => {
          assert.deepStrictEqual(actual, {id: 1});
          assert.ok(dbClient.run.calledOnce);
          assert.ok(dbClient.run.firstArg.match(/"testUser"/));
          done();
        });
    });

    it('should not add a user when the user already present', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error('User Already Exists!'), null),
        serialize: (cb) => cb()
      };
      const dataStore = new DataStore(dbClient);

      const message = 'User Already Exists!';
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

  context('#updateUserDetails', function() {
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

  context('#getUserQuestions', function() {
    it('should give all the questions of a particular', (done) => {
      const questions = [
        {
          id: 1,
          title: 'How to write arrow functions',
          body_text: 'here is a sample function'
        }];
      const dbClient = {
        all: sinon.fake.yields(null, questions)
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getUserQuestions(1)
        .then(actual => {
          assert.deepStrictEqual(actual, questions);
          assert.ok(dbClient.all.calledOnce);
          assert.ok(dbClient.all.firstArg.match(/ques.owner = 1/));
          done();
        });
    });
  });

  context('#getMatchedQuestions', function() {
    it('should give all the questions of a particular query', (done) => {
      const questions = [
        {
          id: 1,
          title: 'How to write arrow functions',
          body_text: 'here is a sample function'
        }];
      const dbClient = {
        all: sinon.fake.yields(null, questions)
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getMatchedQuestions('arrow')
        .then(actual => {
          assert.deepStrictEqual(actual, questions);
          assert.ok(dbClient.all.calledOnce);
          assert.ok(dbClient.all.firstArg.match(/like "%arrow%"/));
          done();
        });
    });
  });

  context('#getAnswersByQuestion', function() {
    it('should give all the answers of a particular question', (done) => {
      const answers = [{id: 1}];
      const dbClient = {
        all: sinon.fake.yields(null, answers)
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getAnswersByQuestion(1)
        .then(actual => {
          assert.deepStrictEqual(actual, answers);
          assert.ok(dbClient.all.calledOnce);
          assert.deepStrictEqual(dbClient.all.args[0][1], [1]);
          done();
        });
    });
  });

  context('#getUserAnswers', function() {
    it('should give all the answers of a particular user', (done) => {
      const answers = [{id: 1}];
      const dbClient = {
        all: sinon.fake.yields(null, answers)
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getUserAnswers(1)
        .then(actual => {
          assert.deepStrictEqual(actual, answers);
          assert.ok(dbClient.all.calledOnce);
          assert.deepStrictEqual(dbClient.all.args[0][1], [1]);
          done();
        });
    });
  });

});

