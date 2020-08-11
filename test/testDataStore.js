const sinon = require('sinon');
const { assert } = require('chai');
const DataStore = require('../src/dataStore');

context('dataStore', () => {
  context('#getQuestionDetails', () => {
    it('it should give details of question when valid id provided', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { title: 'question' }),
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getQuestionDetails('1').then((details) => {
        assert.deepStrictEqual(details, { title: 'question' });
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], ['1']);
        done();
      });
    });

    it('it should produce error when invalid id is given', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, undefined),
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getQuestionDetails('2').catch((error) => {
        assert.deepStrictEqual(error.message, 'Wrong Id Provided');
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], ['2']);
        done();
      });
    });
  });

  context('#init', () => {
    it('it should run database initiation sql', (done) => {
      const dbClient = {
        exec: sinon.fake.yields(),
      };
      const dataStore = new DataStore(dbClient);
      dataStore.init().then(() => {
        assert.ok(dbClient.exec.calledOnce);
        assert.ok(dbClient.exec.firstArg.match(/PRAGMA foreign_keys=ON/));
        done();
      });
    });
  });

  context('#getLastQuestions', () => {
    it('it should give last question id\'s if valid count is given', (done) => {
      const dbClient = {
        all: sinon.fake.yields(null, [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
        ]),
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getLastQuestions(2).then((questionIds) => {
        assert.deepStrictEqual(questionIds, [{ id: 1 }, { id: 2 }]);
        assert.ok(dbClient.all.calledOnce);
        assert.ok(dbClient.all.firstArg.match(/order by ques\.created DESC/));
        done();
      });
    });

    it('it should produce error when invalid count is provided', (done) => {
      const dataStore = new DataStore({});
      dataStore.getLastQuestions(-1).catch((error) => {
        assert.deepStrictEqual(error.message, 'Invalid Count');
        done();
      });
    });
  });

  context('#addQuestionTags', () => {
    it('it should add tags', (done) => {
      const dbClient = {
        get: sinon.fake.yieldsAsync(null, { id: 1 }),
        run: sinon.fake.yieldsAsync(null),
        serialize: (cb) => cb.apply({ dbClient }),
      };

      const dataStore = new DataStore(dbClient);
      dataStore.addQuestionTags(1, ['tag']).then(() => {
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.run.calledTwice);
        assert.deepStrictEqual(dbClient.get.args[0][1], 'tag');
        assert.deepStrictEqual(dbClient.run.args[0][1], 'tag');
        assert.deepStrictEqual(dbClient.run.args[1][1], [1, 1]);
        done();
      });
    });

    it('it should give error when addition of tags doesn\'t happen', (done) => {
      const dbClient = {
        get: sinon.fake.yieldsAsync(new Error('error')),
        run: sinon.fake.yieldsAsync(null),
        serialize: (cb) => cb.apply({ dbClient }),
      };

      const dataStore = new DataStore(dbClient);
      dataStore.addQuestionTags(1, ['tag']).catch((err) => {
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.run.calledOnce
        );
        assert.ok(err.message, 'error');
        assert.deepStrictEqual(dbClient.run.args[0][1], 'tag');
        done();
      });
    });
  });

  context('#addQuestionContent', () => {
    it('it should add a question when valid owner given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
        get: sinon.fake.yields(null, { id: 1 }),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);
      dataStore
        .addQuestionContent(
          { title: 'title', body: 'body', bodyText: 'body' },
          1
        )
        .then((details) => {
          assert.deepStrictEqual(details, { id: 1 });
          assert.ok(dbClient.run.calledOnce);
          assert.ok(dbClient.get.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [
            'title',
            'body',
            'body',
            1,
          ]);
          done();
        });
    });

    it('it should produce error if wrong owner is given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error()),
        get: sinon.fake.yields(null, { id: 1 }),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);
      dataStore
        .addQuestionContent(
          { title: 'title', body: 'body', bodyText: 'body' },
          10
        )
        .catch((err) => {
          assert.deepStrictEqual(err.message, 'Question Insertion Incomplete!');
          assert.deepStrictEqual(dbClient.run.args[0][1], [
            'title',
            'body',
            'body',
            10,
          ]);
          assert.ok(dbClient.run.calledOnce);
          done();
        });
    });

    it('it produce error when last row id fetching could not be performed', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
        get: sinon.fake.yields(new Error('error')),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);
      dataStore
        .addQuestionContent(
          { title: 'title', body: 'body', bodyText: 'body' },
          1
        )
        .catch((err) => {
          assert.deepStrictEqual(err.message, 'error');
          assert.ok(dbClient.run.calledOnce);
          assert.ok(dbClient.get.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [
            'title',
            'body',
            'body',
            1,
          ]);
          done();
        });
    });
  });

  context('#addQuestion', () => {
    it('it should add question', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
        get: sinon.fake.yields(null, { id: 1 }),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);
      dataStore
        .addQuestion(
          { title: 'title', body: 'body', bodyText: 'bodyText', tags: ['tag'] },
          1
        )
        .then((details) => {
          assert.ok(dbClient.run.calledThrice);
          assert.ok(dbClient.get.calledTwice);
          assert.deepStrictEqual(dbClient.run.args[0][1], [
            'title',
            'body',
            'bodyText',
            1,
          ]);
          assert.deepStrictEqual(dbClient.run.args[1][1], 'tag');
          assert.deepStrictEqual(dbClient.run.args[2][1], [1, 1]);
          assert.deepStrictEqual(dbClient.get.args[1][1], 'tag');
          assert.deepStrictEqual(details, { id: 1 });
          done();
        });
    });
  });

  context('#addNewUser', function() {
    const name = 'testUser';
    const avatarUrl = 'avatarUrl.com/u/58025792?v=4';

    it('should add a new user to database', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
        get: sinon.fake.yields(null, { id: 1 }),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.addNewUser(name, avatarUrl).then((actual) => {
        assert.deepStrictEqual(actual, { id: 1 });
        assert.ok(dbClient.run.calledOnce);
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.run.args[0][1], [name, avatarUrl]);
        done();
      });
    });

    it('should not add a user when the user already present', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error('User Already Exists!'), null),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);

      const message = 'User Already Exists!';
      dataStore.addNewUser(name, avatarUrl).catch((err) => {
        assert.equal(err.message, message);
        assert.ok(dbClient.run.calledOnce);
        assert.deepStrictEqual(dbClient.run.args[0][1], [name, avatarUrl]);
        done();
      });
    });

    it('should produce error if fetching new row id fails', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
        get: sinon.fake.yields(new Error('error')),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.addNewUser(name, avatarUrl).catch((err) => {
        assert.equal(err.message, 'error');
        assert.ok(dbClient.run.calledOnce);
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.run.args[0][1], [name, avatarUrl]);
        done();
      });
    });
  });

  describe('#getUser', function() {

    const dbClient = () => { };
    const knex = {};
    knex.table = sinon.fake.returns(knex);
    knex.select = sinon.fake.returns(knex);
    knex.where = sinon.fake.returns(knex);
    knex.first = sinon.fake.returns(knex);

    const dataStore = new DataStore(dbClient, knex);

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
          id: 4,
        },
        isFound: true,
      };

      knex.then = () => Promise.resolve(details);

      dataStore.getUser('github_username', 'testUser')
        .then(actual => {
          assert.deepStrictEqual(actual, details);
          assert.ok(knex.table.calledWith('users'));
          assert.ok(knex.select.calledWith());
          assert.ok(knex.where.calledWith('github_username', '=', 'testUser'));
          done();
        });
    });

    it('should get user details undefined when the user is in not present', (done) => {

      knex.then = () => Promise.resolve({ user: undefined, isFound: false });

      dataStore.getUser('github_username', 'noUser')
        .then(actual => {
          assert.deepStrictEqual(actual, { user: undefined, isFound: false });
          assert.ok(knex.table.calledWith('users'));
          assert.ok(knex.select.calledWith());
          assert.ok(knex.where.calledWith('github_username', '=', 'noUser'));
          done();
        });
    });

    it('Should give error if we given key is not present', (done) => {
      const message = 'no such column: github_user';
      knex.then = () => Promise.reject(new Error(message));

      dataStore.getUser('github_user', 'noUser')
        .catch(err => {
          assert.deepStrictEqual(err.message, message);
          assert.ok(knex.table.calledWith('users'));
          assert.ok(knex.select.calledWith());
          assert.ok(knex.where.calledWith('github_user', '=', 'noUser'));
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
        run: sinon.fake.yields(null, undefined),
      };
      const dataStore = new DataStore(dbClient);

      dataStore
        .updateUserDetails(4, { name, email, location })
        .then((actual) => {
          assert.isUndefined(actual);
          assert.ok(dbClient.run.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [
            name,
            email,
            location,
            '',
            4,
          ]);
          done();
        });
    });

    it('should produce error while db query produces', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error('error')),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.updateUserDetails(4, { name, email, location }).catch((err) => {
        assert.deepStrictEqual(err.message, 'error');
        assert.ok(dbClient.run.calledOnce);
        assert.deepStrictEqual(dbClient.run.args[0][1], [
          name,
          email,
          location,
          '',
          4,
        ]);
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
          body_text: 'here is a sample function',
        },
      ];
      const dbClient = {
        all: sinon.fake.yields(null, questions),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getUserQuestions(1).then((actual) => {
        assert.deepStrictEqual(actual, questions);
        assert.ok(dbClient.all.calledOnce);
        assert.deepStrictEqual(dbClient.all.args[0][1], [1]);
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
          body_text: 'here is a sample function',
        },
      ];
      const dbClient = {
        all: sinon.fake.yields(null, questions),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getMatchedQuestions('arrow').then((actual) => {
        assert.deepStrictEqual(actual, questions);
        assert.ok(dbClient.all.calledOnce);
        assert.include(dbClient.all.args[0][1], { $text: '%arrow%' });
        done();
      });
    });

    it('should give all the questions of a particular user', (done) => {
      const questions = [
        {
          id: 1,
          title: 'How to write arrow functions',
          body_text: 'here is a sample function',
          ownerName: 'john',
        },
      ];
      const dbClient = {
        all: sinon.fake.yields(null, questions),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getMatchedQuestions('@john').then((actual) => {
        assert.deepStrictEqual(actual, questions);
        assert.ok(dbClient.all.calledOnce);
        assert.include(dbClient.all.args[0][1], { $user: '%john%' });
        done();
      });
    });

    it('should give all the questions which has searched tag', (done) => {
      const questions = [
        {
          id: 1,
          title: 'How to write arrow functions',
          body_text: 'here is a sample function',
          ownerName: 'john',
        },
      ];
      const dbClient = {
        all: sinon.fake.yields(null, questions),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getMatchedQuestions('#javascript').then((actual) => {
        assert.deepStrictEqual(actual, questions);
        assert.ok(dbClient.all.calledOnce);
        assert.include(dbClient.all.args[0][1], {
          $tag: '%javascript%',
        });
        done();
      });
    });

    it('should give all the questions which has correct answer', (done) => {
      const questions = [
        {
          id: 1,
          title: 'How to write arrow functions',
          body_text: 'here is a sample function',
          ownerName: 'john',
        },
      ];
      const dbClient = {
        all: sinon.fake.yields(null, questions),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getMatchedQuestions(':accepted').then((actual) => {
        assert.deepStrictEqual(actual, questions);
        assert.ok(dbClient.all.calledOnce);
        assert.include(dbClient.all.args[0][1], {
          $acceptance: 1,
        });
        done();
      });
    });
  });

  context('#getAnswersByQuestion', function() {
    it('should give all the answers of a particular question', (done) => {
      const answers = [{ id: 1 }];
      const dbClient = {
        all: sinon.fake.yields(null, answers),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getAnswersByQuestion(1).then((actual) => {
        assert.deepStrictEqual(actual, answers);
        assert.ok(dbClient.all.calledOnce);
        assert.deepStrictEqual(dbClient.all.args[0][1], [1]);
        done();
      });
    });
  });

  context('#getVote', function() {
    it('should give voteType when valid user and question id given', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { voteType: 0 }),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVote(1, 1, true).then((actual) => {
        assert.deepStrictEqual(actual, { isVoted: true, voteType: 0 });
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.args[0][0].match(/question/));
        assert.deepStrictEqual(dbClient.get.args[0][1], [1, 1]);
        done();
      });
    });

    it('should give voteType when valid user and answer id given', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { voteType: 0 }),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVote(1, 1).then((actual) => {
        assert.deepStrictEqual(actual, { isVoted: true, voteType: 0 });
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.args[0][0].match(/answer/));
        assert.deepStrictEqual(dbClient.get.args[0][1], [1, 1]);
        done();
      });
    });

    it('should give no vote if invalid ids given', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, undefined),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVote(300, 300).then((actual) => {
        assert.deepStrictEqual(actual, { isVoted: false, voteType: undefined });
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], [300, 300]);
        done();
      });
    });

    it('should produce error if database produces', (done) => {
      const dbClient = {
        get: sinon.fake.yields(new Error('error')),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVote(300, 300).catch((err) => {
        assert.deepStrictEqual(err.message, 'Fetching vote failed');
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], [300, 300]);
        done();
      });
    });
  });

  context('#getUserAnswers', function() {
    it('should give all the answers of a particular user', (done) => {
      const answers = [{ id: 1 }];
      const dbClient = {
        all: sinon.fake.yields(null, answers),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getUserAnswers(1).then((actual) => {
        assert.deepStrictEqual(actual, answers);
        assert.ok(dbClient.all.calledOnce);
        assert.deepStrictEqual(dbClient.all.args[0][1], [1]);
        done();
      });
    });

    it('should produce error while db produces error', (done) => {
      const dbClient = {
        all: sinon.fake.yields(new Error('error')),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getUserAnswers(1).catch((err) => {
        assert.deepStrictEqual(err.message, 'error');
        assert.ok(dbClient.all.calledOnce);
        assert.deepStrictEqual(dbClient.all.args[0][1], [1]);
        done();
      });
    });
  });

  context('#addAnswer', function() {
    it('should add the answer without throwing error', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.addAnswer('body', 'bodyText', 1, 1).then(() => {
        assert.ok(dbClient.run.calledOnce);
        assert.deepStrictEqual(dbClient.run.args[0][1], [
          'body',
          'bodyText',
          1,
          1,
        ]);
        done();
      });
    });

    it('should produce error when insertion failed', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error()),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.addAnswer('body', 'bodyText', 100, 1).catch((err) => {
        assert.deepStrictEqual(err.message, 'Answer Insertion Failed!');
        assert.ok(dbClient.run.calledOnce);
        assert.deepStrictEqual(dbClient.run.args[0][1], [
          'body',
          'bodyText',
          100,
          1,
        ]);
        done();
      });
    });
  });

  context('#saveComment', function() {
    const dbClient = () => { };
    const knex = {};
    knex.table = sinon.fake.returns(knex);
    knex.insert = sinon.fake.returns(Promise.resolve([1]));

    const dataStore = new DataStore(dbClient, knex);

    it('should add the answer comment', (done) => {
      dataStore.saveComment({
        body: 'body', owner: 1, id: 1, creationTime: '2020-12-12 12:34:21'
      }).then(([id]) => {
        assert.equal(id, 1);
        assert.ok(knex.table.calledWith('answer_comments'));
        assert.ok(knex.insert.calledWith({
          body: 'body', owner: 1, answer: 1, created: '2020-12-12 12:34:21',
          'last_modified': '2020-12-12 12:34:21'
        }));
        done();
      });
    });

    it('should add the question comment', (done) => {

      dataStore.saveComment({
        body: 'body', owner: 1, id: 1, creationTime: '2020-12-12 12:34:21'
      }, true).then(([id]) => {
        assert.equal(id, 1);
        assert.ok(knex.table.calledWith('question_comments'));
        assert.ok(knex.insert.calledWith({
          body: 'body', owner: 1, question: 1, created: '2020-12-12 12:34:21',
          'last_modified': '2020-12-12 12:34:21'
        }));
        done();
      });
    });

    it('should produce error when insertion failed', (done) => {

      const message = 'Comment Insertion Failed!';
      knex.insert = sinon.fake.returns(Promise.reject(message));

      dataStore.saveComment({
        body: 'body', owner: 1, id: 1, creationTime: '2020-12-12 12:34:21'
      }).catch(err => {
        assert.deepStrictEqual(err.message, message);
        assert.ok(knex.table.calledWith('answer_comments'));
        done();
      });
    });
  });

  context('#getQuestionTags', () => {
    it('should give all the tags used in questions', (done) => {
      const dbClient = {
        all: sinon.fake.yields(null, [
          { tag_name: 'sqlite3' },
          { tag_name: 'javascript' },
        ]),
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getQuestionTags(1).then((tags) => {
        assert.ok(dbClient.all.calledOnce);
        assert.deepStrictEqual(dbClient.all.args[0][1], 1);
        assert.deepStrictEqual(tags, ['sqlite3', 'javascript']);
        done();
      });
    });
  });

  context('#addVote', function() {
    this.afterEach(() => sinon.restore());
    it('should add a question vote when valid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon
        .stub(dataStore, 'getVote')
        .resolves({ isVoted: false });

      dataStore.addVote(1, 1, 1, true).then((actual) => {
        assert.isUndefined(actual);
        assert.ok(dbClient.run.calledOnce);
        assert.ok(stubbedGetVote.calledOnce);
        assert.ok(dbClient.run.args[0][0].match(/question/));
        assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
        assert.ok(dbClient.run.args[0][0].match(/insert/));
        assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, true]);
        done();
      });
    });

    it('should add a answer vote when valid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon
        .stub(dataStore, 'getVote')
        .resolves({ isVoted: false });

      dataStore.addVote(1, 1, 1, false).then((actual) => {
        assert.isUndefined(actual);
        assert.ok(dbClient.run.calledOnce);
        assert.ok(stubbedGetVote.calledOnce);
        assert.ok(dbClient.run.args[0][0].match(/answer/));
        assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
        assert.ok(dbClient.run.args[0][0].match(/insert/));
        assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, false]);
        done();
      });
    });

    it('should modify a question vote when same question user pair exists', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon
        .stub(dataStore, 'getVote')
        .resolves({ isVoted: true });

      dataStore.addVote(1, 1, 1, true).then((actual) => {
        assert.isUndefined(actual);
        assert.ok(dbClient.run.calledOnce);
        assert.ok(stubbedGetVote.calledOnce);
        assert.ok(dbClient.run.args[0][0].match(/set/));
        assert.ok(dbClient.run.args[0][0].match(/question/));
        assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
        assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, true]);
        done();
      });
    });

    it('should modify a answer vote when same answer user pair exists', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon
        .stub(dataStore, 'getVote')
        .resolves({ isVoted: true });

      dataStore.addVote(1, 1, 1, false).then((actual) => {
        assert.isUndefined(actual);
        assert.ok(dbClient.run.calledOnce);
        assert.ok(stubbedGetVote.calledOnce);
        assert.ok(dbClient.run.args[0][0].match(/set/));
        assert.ok(dbClient.run.args[0][0].match(/answer/));
        assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
        assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, false]);
        done();
      });
    });

    it('should produce error when running query makes error', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error()),
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon
        .stub(dataStore, 'getVote')
        .resolves({ isVoted: true });

      dataStore.addVote(1, 1, 1, false).catch((err) => {
        assert.deepStrictEqual(err.message, 'Vote Addition Failed');
        assert.ok(dbClient.run.calledOnce);
        assert.ok(stubbedGetVote.calledOnce);
        assert.ok(dbClient.run.args[0][0].match(/set/));
        assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
        assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, false]);
        done();
      });
    });
  });

  context('#deleteVote', function() {
    it('should delete a question vote when valid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.deleteVote(1, 1, true).then((actual) => {
        assert.isUndefined(actual);
        assert.ok(dbClient.run.calledOnce);
        assert.ok(dbClient.run.args[0][0].match(/question/));
        assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1]);
        done();
      });
    });

    it('should delete a answer vote when valid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.deleteVote(1, 1).then((actual) => {
        assert.isUndefined(actual);
        assert.ok(dbClient.run.calledOnce);
        assert.ok(dbClient.run.args[0][0].match(/answer/));
        assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1]);
        done();
      });
    });

    it('should produce error when invalid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error()),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.deleteVote(100, 100).catch((err) => {
        assert.deepStrictEqual(err.message, 'Vote Deletion Failed');
        assert.ok(dbClient.run.calledOnce);
        assert.deepStrictEqual(dbClient.run.args[0][1], [100, 100]);
        done();
      });
    });
  });

  context('#getVoteCount', function() {
    it('should give question vote count for a question', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { voteCount: 10 }),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVoteCount(1, true).then((voteCount) => {
        assert.deepStrictEqual(voteCount, { voteCount: 10 });
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.args[0][0].match(/question/));
        assert.deepStrictEqual(dbClient.get.args[0][1], [1]);
        done();
      });
    });

    it('should give answer vote count for a answer', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { voteCount: 10 }),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVoteCount(1).then((voteCount) => {
        assert.deepStrictEqual(voteCount, { voteCount: 10 });
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.args[0][0].match(/answer/));
        assert.deepStrictEqual(dbClient.get.args[0][1], [1]);
        done();
      });
    });

    it('should produce error when database produces', (done) => {
      const dbClient = {
        get: sinon.fake.yields(new Error(), {}),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVoteCount(100).catch((err) => {
        assert.deepStrictEqual(err.message, 'Vote Count Fetching Error');
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], [100]);
        done();
      });
    });
  });

  context('#rejectAnswer', function() {

    const dbClient = () => { };
    const knex = {};

    knex.table = sinon.fake.returns(knex);
    knex.update = sinon.fake.returns(knex);

    const dataStore = new DataStore(dbClient, knex);

    it('should reject an answer', (done) => {
      knex.where = sinon.fake.returns(Promise.resolve());

      dataStore.rejectAnswer(1).then(() => {
        assert.ok(knex.table.calledWith('answers'));
        assert.ok(knex.update.calledWith('is_accepted', 0));
        assert.ok(knex.where.calledWith('id', '=', 1));
        done();
      });
    });

    it('should not reject an answer when invalid answer id given', (done) => {
      knex.where = sinon.fake.returns(Promise.reject());

      dataStore.rejectAnswer(2454).catch(() => {
        assert.ok(knex.table.calledWith('answers'));
        assert.ok(knex.update.calledWith('is_accepted', 0));
        assert.ok(knex.where.calledWith('id', '=', 2454));
        done();
      });
    });
  });

  context('#acceptAnswer', function() {
    const dbClient = () => { };
    const knex = {};

    const where = sinon.stub();
    where.withArgs('id', '=', 1).returns(knex);
    where.withArgs('question', '=', 1).returns(Promise.resolve());
    where.withArgs('question', '=', 2454).returns(Promise.reject());

    knex.table = sinon.fake.returns(knex);
    knex.select = sinon.fake.returns(knex);
    knex.where = where;
    knex.first = sinon.fake.returns(Promise.resolve({ question: 1 }));
    knex.update = sinon.fake.returns(knex);
    knex.raw = sinon.fake.returns(knex);

    const dataStore = new DataStore(dbClient, knex);

    it('should accept an answer', (done) => {

      dataStore.acceptAnswer(1).then(() => {
        assert.equal(knex.table.args[0], 'answers');
        assert.equal(knex.table.args[1], 'answers');
        done();
      });
    });

    it('should not accept an answer when invalid answer id given', (done) => {
      knex.first = sinon.fake.returns(Promise.resolve({ question: 2454 }));
      dataStore.acceptAnswer(1).catch(() => {
        assert.equal(knex.table.args[0], 'answers');
        assert.equal(knex.table.args[1], 'answers');
        done();
      });
    });
  });

  context('#getAnswerById', function() {
    it('should serve answer Details', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { id: 1 }),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getAnswerById(1).then((details) => {
        assert.deepStrictEqual(details, { id: 1 });
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], [1]);
        done();
      });
    });

    it('should produce error while invalid id is given', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, undefined),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getAnswerById(100).catch((err) => {
        assert.deepStrictEqual(err.message, 'Wrong Id Provided');
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], [100]);
        done();
      });
    });
  });

  context('#getComments', function() {
    it('should serve question comments when isQuestion is true', (done) => {
      const dbClient = {
        all: sinon.fake.yields(null, [{ id: 1 }]),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getComments(1, true).then((details) => {
        assert.deepStrictEqual(details, [{ id: 1 }]);
        assert.ok(dbClient.all.calledOnce);
        assert.ok(dbClient.all.args[0][0].match('question'));
        assert.deepStrictEqual(dbClient.all.args[0][1], [1]);
        done();
      });
    });

    it('should serve answer comments when isQuestion is false', (done) => {
      const dbClient = {
        all: sinon.fake.yields(null, [{ id: 1 }]),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getComments(1, false).then((details) => {
        assert.deepStrictEqual(details, [{ id: 1 }]);
        assert.ok(dbClient.all.calledOnce);
        assert.ok(dbClient.all.args[0][0].match('answer'));
        assert.deepStrictEqual(dbClient.all.args[0][1], [1]);
        done();
      });
    });
  });

  context('#getPopularTags', function() {
    const dbClient = () => { };
    const knex = {};
    knex.select = sinon.fake.returns(knex);
    knex.count = sinon.fake.returns(knex);
    knex.from = sinon.fake.returns(knex);
    knex.leftJoin = sinon.fake.returns(knex);
    knex.where = sinon.fake.returns(knex);
    knex.groupBy = sinon.fake.returns(knex);
    knex.orderBy = sinon.fake.returns(knex);
    knex.pluck = sinon.fake.returns(knex);

    const dataStore = new DataStore(dbClient, knex);

    it('should get all matched popular tags', (done) => {

      knex.limit = () => Promise.resolve(['javascript']);

      dataStore.getPopularTags('java', 10)
        .then(actual => {
          assert.deepStrictEqual(actual, ['javascript']);
          assert.ok(knex.select.calledWith('tag_name'));
          assert.ok(knex.from.calledWith('questions_tags'));
          assert.ok(knex.where.calledWith('tag_name', 'like', '%java%'));
          done();
        });
    });
  });
});
