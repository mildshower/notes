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
        assert.ok(dbClient.get.firstArg.match(/ques.id = 1/));
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
        assert.ok(dbClient.get.firstArg.match(/ques.id = 2/));
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

  context('#getTagId', () => {
    it('it should give tag id when tag name is valid', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { id: 1 }),
        run: sinon.fake.yields(null),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getTagId('js').then((details) => {
        assert.deepStrictEqual(details, { id: 1 });
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.run.calledOnce);
        assert.deepStrictEqual(dbClient.run.args[0][1], 'js');
        done();
      });
    });

    it('it should give error when tag name is not valid', (done) => {
      const dbClient = {
        get: sinon.fake.yields(new Error('sqlite error')),
        run: sinon.fake.yields(null),
        serialize: (cb) => cb(),
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getTagId('badTag').catch((err) => {
        assert.deepStrictEqual(err.message, 'sqlite error');
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.run.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], 'badTag');
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
        get: sinon.fake.yields(null, {id: 1}),
        serialize: (cb) => cb()
      };
      const dataStore = new DataStore(dbClient);
      dataStore.addQuestion({title: 'title', body: 'body', bodyText: 'bodyText', tags: ['tag']}, 1)
        .then(details => {
          assert.ok(dbClient.run.calledThrice);
          assert.ok(dbClient.get.calledTwice);
          assert.deepStrictEqual(dbClient.run.args[0][1], ['title', 'body', 'bodyText', 1]);
          assert.deepStrictEqual(dbClient.run.args[1][1], 'tag');
          assert.deepStrictEqual(dbClient.run.args[2][1], [1, 1]);
          assert.deepStrictEqual(dbClient.get.args[1][1], 'tag');
          assert.deepStrictEqual(details, {id: 1});
          done();
        });
    });
  });

  context('#addNewUser', function () {
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

  describe('#getUser', function () {
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
          user_id: 4,
        },
        isFound: true,
      };

      const dbClient = {
        get: sinon.fake.yields(null, details.user),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getUser('github_username', 'testUser').then((actual) => {
        assert.deepStrictEqual(actual, details);
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], ['testUser']);
        done();
      });
    });

    it('should get user details undefined when the user is in not present', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, undefined),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getUser('github_username', 'noUser').then((actual) => {
        assert.deepStrictEqual(actual, { user: undefined, isFound: false });
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], ['noUser']);
        done();
      });
    });

    it('Should give error if we given key is not present', (done) => {
      const dbClient = {
        get: sinon.fake.yields(
          {
            message: 'no such column: github_user',
          },
          null
        ),
      };
      const dataStore = new DataStore(dbClient);

      const message = 'no such column: github_user';
      dataStore.getUser('github_user', 'noUser').catch((err) => {
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], ['noUser']);
        assert.equal(err.message, message);
        done();
      });
    });
  });

  context('#updateUserDetails', function () {
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

      dataStore
        .updateUserDetails(4, { name, email, location })
        .catch((err) => {
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

  context('#getUserQuestions', function () {
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

  context('#getMatchedQuestions', function () {
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
        assert.deepStrictEqual(dbClient.all.args[0][1], { $regExp: '%arrow%' });
        done();
      });
    });
  });

  context('#getAnswersByQuestion', function () {
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

  context('#getVote', function () {
    it('should give voteType when valid user and question id given', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { voteType: 0 }),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVote(1, 1, 'question').then((actual) => {
        assert.deepStrictEqual(actual, { isVoted: true, voteType: 0 });
        assert.ok(dbClient.get.calledOnce);
        assert.deepStrictEqual(dbClient.get.args[0][1], [1, 1]);
        done();
      });
    });

    it('should give voteType when valid user and answer id given', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, { voteType: 0 }),
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVote(1, 1, 'answer').then((actual) => {
        assert.deepStrictEqual(actual, { isVoted: true, voteType: 0 });
        assert.ok(dbClient.get.calledOnce);
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

  context('#getUserAnswers', function () {
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

  context('#addAnswer', function () {
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

  context('#getTags', () => {
    it('should give all the tags used in questions', (done) => {
      const dbClient = {
        all: sinon.fake.yields(null, [{tag_name: 'sqlite3'}, {tag_name: 'javascript'}]),
      };
      const dataStore = new DataStore(dbClient);
      dataStore.getTags([{id: 1}])
        .then(tags => {
          assert.ok(dbClient.all.calledOnce);
          assert.deepStrictEqual(dbClient.all.args[0][1], 1);
          assert.deepStrictEqual(tags, ['sqlite3', 'javascript']);
          done();
        });
    });
  });

  context('#addQuestionVote', function() {
    this.afterEach(() => sinon.restore());
    it('should add a question vote when valid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null)
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon.stub(dataStore, 'getVote').resolves({isVoted: false});

      dataStore.addQuestionVote(1, 1, 1)
        .then(actual => {
          assert.isUndefined(actual);
          assert.ok(dbClient.run.calledOnce);
          assert.ok(stubbedGetVote.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
          assert.ok(dbClient.run.args[0][0].match(/insert/));
          assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, 'question']);
          done();
        });
    });

    it('should modify a question vote when same question user pair exists', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null)
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon.stub(dataStore, 'getVote').resolves({isVoted: true});

      dataStore.addQuestionVote(1, 1, 1)
        .then(actual => {
          assert.isUndefined(actual);
          assert.ok(dbClient.run.calledOnce);
          assert.ok(stubbedGetVote.calledOnce);
          assert.ok(dbClient.run.args[0][0].match(/set/));
          assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
          assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, 'question']);
          done();
        });
    });

    it('should produce error when running query makes error', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error())
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon.stub(dataStore, 'getVote').resolves({isVoted: true});

      dataStore.addQuestionVote(1, 1, 1)
        .catch(err => {
          assert.deepStrictEqual(err.message, 'Vote Addition Failed');
          assert.ok(dbClient.run.calledOnce);
          assert.ok(stubbedGetVote.calledOnce);
          assert.ok(dbClient.run.args[0][0].match(/set/));
          assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
          assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, 'question']);
          done();
        });
    });
  });

  context('#addAnswerVote', function() {
    this.afterEach(() => sinon.restore());
    it('should add a answer vote when valid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null)
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon.stub(dataStore, 'getVote').resolves({isVoted: false});

      dataStore.addAnswerVote(1, 1, 1)
        .then(actual => {
          assert.isUndefined(actual);
          assert.ok(dbClient.run.calledOnce);
          assert.ok(stubbedGetVote.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
          assert.ok(dbClient.run.args[0][0].match(/insert/));
          assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, 'answer']);
          done();
        });
    });

    it('should modify a answer vote when same answer user pair exists', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null)
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon.stub(dataStore, 'getVote').resolves({isVoted: true});

      dataStore.addAnswerVote(1, 1, 1)
        .then(actual => {
          assert.isUndefined(actual);
          assert.ok(dbClient.run.calledOnce);
          assert.ok(stubbedGetVote.calledOnce);
          assert.ok(dbClient.run.args[0][0].match(/set/));
          assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
          assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, 'answer']);
          done();
        });
    });

    it('should produce error when running query makes error', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error())
      };
      const dataStore = new DataStore(dbClient);
      const stubbedGetVote = sinon.stub(dataStore, 'getVote').resolves({isVoted: true});

      dataStore.addAnswerVote(1, 1, 1)
        .catch(err => {
          assert.deepStrictEqual(err.message, 'Vote Addition Failed');
          assert.ok(dbClient.run.calledOnce);
          assert.ok(stubbedGetVote.calledOnce);
          assert.ok(dbClient.run.args[0][0].match(/set/));
          assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1, 1]);
          assert.deepStrictEqual(stubbedGetVote.args[0], [1, 1, 'answer']);
          done();
        });
    });
  });

  context('#deleteQuestionVote', function() {
    it('should delete a question vote when valid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null)
      };
      const dataStore = new DataStore(dbClient);

      dataStore.deleteQuestionVote(1, 1)
        .then(actual => {
          assert.isUndefined(actual);
          assert.ok(dbClient.run.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1]);
          done();
        });
    });

    it('should produce error when invalid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error())
      };
      const dataStore = new DataStore(dbClient);

      dataStore.deleteQuestionVote(100, 100)
        .catch(err => {
          assert.deepStrictEqual(err.message, 'Vote Deletion Failed');
          assert.ok(dbClient.run.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [100, 100]);
          done();
        });
    });
  });

  context('#deleteAnswerVote', function() {
    it('should delete a question vote when valid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(null)
      };
      const dataStore = new DataStore(dbClient);

      dataStore.deleteAnswerVote(1, 1)
        .then(actual => {
          assert.isUndefined(actual);
          assert.ok(dbClient.run.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [1, 1]);
          done();
        });
    });

    it('should produce error when invalid credentials given', (done) => {
      const dbClient = {
        run: sinon.fake.yields(new Error())
      };
      const dataStore = new DataStore(dbClient);

      dataStore.deleteAnswerVote(100, 100)
        .catch(err => {
          assert.deepStrictEqual(err.message, 'Vote Deletion Failed');
          assert.ok(dbClient.run.calledOnce);
          assert.deepStrictEqual(dbClient.run.args[0][1], [100, 100]);
          done();
        });
    });
  });

  context('#getVoteCount', function() {
    it('should give vote count for the content', (done) => {
      const dbClient = {
        get: sinon.fake.yields(null, {voteCount: 10})
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVoteCount('question', 1)
        .then(voteCount => {
          assert.deepStrictEqual(voteCount, 10);
          assert.ok(dbClient.get.calledOnce);
          assert.deepStrictEqual(dbClient.get.args[0][1], [1]);
          done();
        });
    });

    it('should produce error when database produces', (done) => {
      const dbClient = {
        get: sinon.fake.yields(new Error(), {})
      };
      const dataStore = new DataStore(dbClient);

      dataStore.getVoteCount('wrongType', 100)
        .catch(err => {
          assert.deepStrictEqual(err.message, 'Vote Count Fetching Error');
          assert.ok(dbClient.get.calledOnce);
          assert.deepStrictEqual(dbClient.get.args[0][1], [100]);
          done();
        });
    });
  });

});
