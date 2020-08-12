const request = require('supertest');
const sinon = require('sinon');
const fetch = require('node-fetch');
const Sessions = require('../src/sessions');
const sqlite3 = require('sqlite3').verbose();
const DataStore = require('../src/dataStore');
const dbClient = new sqlite3.Database('data/ho_test.db');
const knex = require('../src/knexConnection')('data/ho_test.db');
const { app } = require('../src/routes');
let sessionId1;

before(() => {
  app.locals.dataStore = new DataStore(dbClient, knex);
  app.locals.dataStore.init();
  app.locals.sessions = new Sessions();
  sessionId1 = app.locals.sessions.addSession('1');
});
after(() => knex.destroy());

describe('GET', () => {
  context('/', () => {
    it('Should be redirected to home path (/home) for path "/"', done => {
      request(app)
        .get('/')
        .expect(302)
        .expect('Location', '/home', done);
    });

    it('Should get home page for path "/home"', function(done) {
      this.timeout(3000);
      request(app)
        .get('/home')
        .expect('Content-Type', /text\/html/)
        .expect(200, /heapOverflow \| Home/, done);
    });

    it('should get public file for  the home page', done => {
      request(app)
        .get('/scripts/editor.js')
        .expect('Content-Type', 'application/javascript; charset=UTF-8')
        .expect(200, /snow/, done);
    });
  });

  context('userActions', () => {
    it('should serve unauthorized if userAction tried to performed without login', done => {
      request(app)
        .get('/user/askQuestion')
        .expect(401, done);
    });
  });

  context('/askQuestion', () => {
    it('should serve askQuestion page when logged in', (done) => {
      request(app)
        .get('/user/askQuestion')
        .set('Cookie', `session=${sessionId1}`)
        .expect('Content-Type', /text\/html/)
        .expect(200, /heapOverflow \| Ask/, done);
    });
  });

  context('/tags', () => {
    it('should get all matched popular tags', (done) => {
      request(app)
        .get('/tags?exp=j')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, '["javascript","node.js"]', done);
    });
  });

  context('/question', () => {
    it('should serve question page for valid question id', (done) => {
      request(app)
        .get('/question/1')
        .set('Cookie', `session=${sessionId1}`)
        .expect('Content-Type', /text\/html/)
        .expect(200, /heapOverflow \| Question/, done);
    });

    it('should serve "wrong Id" when invalid id is given', (done) => {
      request(app)
        .get('/question/100')
        .expect('Content-Type', /text\/html/)
        .expect(404, /Couldn't found question with the given id/, done);
    });
  });

  context('/questionDetails', () => {
    it('should serve question details for valid question id', (done) => {
      request(app)
        .get('/questionDetails?id=2')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, /"id":2/, done);
    });

    it('should serve "wrong Id" when invalid id is given', (done) => {
      request(app)
        .get('/questionDetails?id=100')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(404, /Wrong Id Provided/, done);
    });
  });

  context('/answers', () => {
    it('should serve answers of a specific question id', (done) => {
      request(app)
        .get('/answers?id=1')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, /"quesId":1/, done);
    });
  });

  context('/entry', () => {
    it('should be redirected to gitHub authentication when tried to login', (done) => {
      request(app)
        .get('/entry?targetPath=home&type=login')
        .expect(302)
        .expect('Location', /github\.com\/login\/oauth\/authorize.*login\?targetPath=home/, done);
    });

    it('should be redirected to gitHub authentication when tried to signUp', (done) => {
      request(app)
        .get('/entry?targetPath=home&type=signUp')
        .expect(302)
        .expect('Location', /github\.com\/login\/oauth\/authorize.*signUp\?targetPath=home/, done);
    });

    it('should get not found if wrong type given', (done) => {
      request(app)
        .get('/entry?targetPath=home&type=wrong')
        .expect(404, /heapOverflow \| Oops/, done);
    });
  });

  context('/login', () => {
    afterEach(() => sinon.restore());
    it('should redirect to targetPath when right credentials given', (done) => {
      const stubbed = sinon.stub(fetch, 'Promise');
      stubbed.returns(Promise.resolve({ json: () => ({ 'access_token': 1, login: 'user2' }) }));
      request(app)
        .get('/login?code=1&targetPath=/home')
        .expect(302)
        .expect('Location', '/home', done);
    });

    it('should redirect to error page when account doen\'t exist', (done) => {
      const stubbed = sinon.stub(fetch, 'Promise');
      stubbed.returns(Promise.resolve({ json: () => ({ 'access_token': 1, login: 'user11' }) }));
      request(app)
        .get('/login?code=1&targetPath=home')
        .expect(406, /Oops\.\./, done);
    });

    it('should redirect to home page if auth error occurs', (done) => {
      request(app)
        .get('/login?error=errorMsg')
        .expect(302)
        .expect('Location', '/home', done);
    });
  });

  context('/signUp', function() {
    afterEach(() => sinon.restore());
    it('should redirect to signUp page if user doesn\'t exist', (done) => {
      const stubbed = sinon.stub(fetch, 'Promise');
      stubbed.returns(Promise.resolve({
        json: () =>
          ({ 'access_token': 1, login: 'user20', avatar_url: 'avatar' })
      }));
      request(app)
        .get('/signUp?code=1&targetPath=/home')
        .expect(302)
        .expect('Location', '/user/signUpForm?targetPath=/home', done);
    });

    it('should redirect to error page if user exists', (done) => {
      const stubbed = sinon.stub(fetch, 'Promise');
      stubbed.returns(Promise.resolve({
        json: () =>
          ({ 'access_token': 1, login: 'user2', avatar_url: 'avatar' })
      }));
      request(app)
        .get('/signUp?code=1&targetPath=home')
        .expect(406, /Oops\.\./, done);
    });
  });

  context('/signUpForm', () => {
    it('should serve signUp page when the person is new user', (done) => {
      request(app)
        .get('/user/signUpForm')
        .set('Cookie', `session=${sessionId1}`)
        .expect('Content-Type', /text\/html/)
        .expect(200, /heapOverflow \| Sign Up/, done);
    });
  });

  context('/search', () => {
    it('should serve search page with search result', (done) => {
      request(app)
        .get('/search?searchQuery=foreign')
        .expect('Content-Type', /text\/html/)
        .expect(200, /heapOverflow \| Search/, done);
    });
  });
});

describe('POST', function() {
  context('/saveDetails', () => {
    it('should save user details when he is authorized', (done) => {
      request(app)
        .post('/user/saveDetails?targetPath=/home')
        .set('Cookie', `session=${sessionId1}`)
        .send('name=Sid&email=sudipta.kundu@abc.com&location=Bangalore')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(302)
        .expect('Location', '/home', done);
    });
  });

  context('/saveQuestion', () => {
    it('should save given valid question', (done) => {
      request(app)
        .post('/user/saveQuestion')
        .set('Cookie', `session=${sessionId1}`)
        .send({ title: 'How to configure vim?', body: '{"ops":[{"insert":"don\'t know about .vimrc"}]}', bodyText: 'bodyText', tags: [] })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, /{"id":.*}/, done);
    });
  });

  context('/addVote', () => {
    it('should add question vote when valid ids given', (done) => {
      request(app)
        .post('/user/addVote')
        .set('Cookie', `session=${sessionId1}`)
        .set('Content-Type', 'application/json')
        .send({ id: 1, voteType: 1, isQuestionVote: true })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, /{"isSucceeded":true/, done);
    });

    it('should add answer vote when valid ids given', (done) => {
      request(app)
        .post('/user/addVote')
        .set('Cookie', `session=${sessionId1}`)
        .set('Content-Type', 'application/json')
        .send({ id: 1, voteType: 1 })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, /{"isSucceeded":true/, done);
    });

    it('should produce error when invalid details given', (done) => {
      request(app)
        .post('/user/addVote')
        .set('Cookie', `session=${sessionId1}`)
        .set('Content-Type', 'application/json')
        .send({ id: 100, voteType: 100, isQuestionVote: true })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(400, '{"error":"Vote Addition Failed"}', done);
    });
  });

  context('/deleteVote', () => {
    it('should delete question vote when valid ids given', (done) => {
      request(app)
        .post('/user/deleteVote')
        .set('Cookie', `session=${sessionId1}`)
        .set('Content-Type', 'application/json')
        .send({ id: 4, isQuestionVote: true })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, /{"isSucceeded":true/, done);
    });

    it('should delete answer vote when valid ids given', (done) => {
      request(app)
        .post('/user/deleteVote')
        .set('Cookie', `session=${sessionId1}`)
        .set('Content-Type', 'application/json')
        .send({ id: 6 })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, /{"isSucceeded":true/, done);
    });
  });

  context('/saveAnswer', () => {
    it('should save given valid answer', (done) => {
      request(app)
        .post('/user/saveAnswer')
        .set('Cookie', `session=${sessionId1}`)
        .send({ body: '{"ops":[{"insert":"User require"}]}', bodyText: 'use require', quesId: 4 })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, '{"isSaved":true}', done);
    });

    it('should serve bad request if wrong details given', (done) => {
      request(app)
        .post('/user/saveAnswer')
        .set('Cookie', `session=${sessionId1}`)
        .send({ body: '{"ops":[{"insert":"User require"}]}', bodyText: 'use require', quesId: 400 })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(400, '{"isSaved":false}', done);
    });
  });

  context('/saveComment', () => {
    it('should save given valid comment', (done) => {
      request(app)
        .post('/user/saveComment')
        .set('Cookie', `session=${sessionId1}`)
        .send({ body: 'comment', isQuestionComment: true, id: 1 })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, /{"isSucceeded":true/, done);
    });

    it('should serve not acceptable if wrong details given', (done) => {
      request(app)
        .post('/user/saveComment')
        .set('Cookie', `session=${sessionId1}`)
        .send({ body: 'comment', isQuestionComment: true, id: 10094570 })
        .set('Content-Type', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(406, '{"error":"Comment Insertion Failed!"}', done);
    });
  });

  context('/profile', () => {
    it('should serve profile page when asked with valid id', (done) => {
      request(app)
        .get('/profile/1')
        .expect('Content-Type', /text\/html/)
        .expect(200, /heapOverflow \| Profile/, done);
    });

    it('should serve error page when asked with invalid id', (done) => {
      request(app)
        .get('/profile/34732')
        .expect('Content-Type', /text\/html/)
        .expect(404, /heapOverflow \| Oops/, done);
    });
  });

  context('/editProfile', () => {
    it('should give edit profile page when user asked to edit his own profile', (done) => {
      request(app)
        .get('/user/editProfile')
        .set('Cookie', `session=${sessionId1}`)
        .expect('Content-Type', /text\/html/)
        .expect(200, /heapOverflow \| Edit profile/, done);
    });
  });

  context('/acceptAnswer', () => {
    it('should accept the answer', (done) => {
      request(app)
        .post('/user/acceptAnswer')
        .set('Cookie', `session=${sessionId1}`)
        .send({ answerId: 1 })
        .expect('Content-Type', /json/)
        .expect(200, '{"isSucceeded":true}', done);
    });

    it('should not accept if someone else than the question owner tries to accept', (done) => {
      request(app)
        .post('/user/acceptAnswer')
        .set('Cookie', `session=${sessionId1}`)
        .send({ answerId: 4 })
        .expect('Content-Type', /json/)
        .expect(406, /error/, done);
    });
  });

  context('/rejectAnswer', () => {
    it('should reject the answer', (done) => {
      request(app)
        .post('/user/rejectAnswer')
        .set('Cookie', `session=${sessionId1}`)
        .send({ answerId: 1 })
        .expect('Content-Type', /json/)
        .expect(200, '{"isSucceeded":true}', done);
    });
  });

  context('/logout', () => {
    it('should clear session and redirect to home page', (done) => {
      request(app)
        .get('/logout')
        .expect(302)
        .expect('Set-Cookie', /session=;/)
        .expect('Location', '/home', done);
    });
  });
});
