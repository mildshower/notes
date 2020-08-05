const request = require('supertest');
const sinon = require('sinon');
const fetch = require('node-fetch');
const { app } = require('../src/routes');
const Sessions = require('../src/sessions');

describe('GET', () => {
  context('/', () => {
    it('Should be redirected to home path (/home) for path "/"', done => {
      request(app)
        .get('/')
        .set('Accept', '*/*')
        .expect(302)
        .expect('Location', '/home', done);
    });

    it('Should get home page for path "/home"', function(done) {
      this.timeout(3000);
      request(app)
        .get('/home')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow \| Home/, done);
    });

    it('should get public file for  the home page', done => {
      request(app)
        .get('/css/header.css')
        .set('accept', '*/*')
        .expect(200)
        .expect('Content-Type', /text\/css/)
        .expect(/#icon {/, done);
    });
  });

  context('/askQuestion', () => {
    it('should serve askQuestion page when logged in', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .get('/askQuestion')
        .set('accept', '*/*')
        .set('Cookie', `session=${id}`)
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow \| Ask/, done);
    });

    it('should serve unauthorized if not logged in', (done) => {
      request(app)
        .get('/askQuestion')
        .set('accept', '*/*')
        .expect(401, done);
    });
  });

  context('/question', () => {
    it('should serve question page for valid question id', (done) => {
      request(app)
        .get('/question?id=1')
        .set('accept', '*/*')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow \| Question/, done);
    });

    it('should serve question page with vote highlight if voter user logged in', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('2');
      app.locals.sessions = sessions;
      request(app)
        .get('/question?id=1')
        .set('Cookie', `session=${id}`)
        .set('accept', '*/*')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/chosen/)
        .expect(/heapOverflow \| Question/, done);
    });

    it('should serve "wrong Id" when invalid id is given', (done) => {
      request(app)
        .get('/question?id=100')
        .set('accept', '*/*')
        .expect(404)
        .expect('Content-Type', /text\/html/)
        .expect(/Couldn't found question with the given id/, done);
    });
  });

  context('/questionDetails', () => {
    it('should serve question details for valid question id', (done) => {
      request(app)
        .get('/questionDetails?id=2')
        .set('accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/"id":2/, done);
    });

    it('should serve "wrong Id" when invalid id is given', (done) => {
      request(app)
        .get('/questionDetails?id=100')
        .set('accept', '*/*')
        .expect(404)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/Wrong Id Provided/, done);
    });
  });

  context('/answers', () => {
    it('should serve answers of a specific question id', (done) => {
      request(app)
        .get('/answers?id=1')
        .set('accept', '*/*')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/"quesId":1/, done);
    });
  });

  context('/entry', () => {
    it('should be redirected to gitHub authentication when tried to login', (done) => {
      request(app)
        .get('/entry?targetPath=home&type=login')
        .set('accept', '*/*')
        .expect(302)
        .expect('Location', /\?targetPath=home/)
        .expect('Location', /login/)
        .expect('Location', /github.com\/login\/oauth\/authorize/, done);
    });

    it('should be redirected to gitHub authentication when tried to signUp', (done) => {
      request(app)
        .get('/entry?targetPath=home&type=signUp')
        .set('accept', '*/*')
        .expect(302)
        .expect('Location', /\?targetPath=home/)
        .expect('Location', /signUp/)
        .expect('Location', /github.com\/login\/oauth\/authorize/, done);
    });

    it('should get not found if wrong type given', (done) => {
      request(app)
        .get('/entry?targetPath=home&type=wrong')
        .set('accept', '*/*')
        .expect(/heapOverflow \| Oops/)
        .expect(404, done);
    });
  });

  context('/login', () => {
    afterEach(() => sinon.restore());
    it('should redirect to targetPath when right credentials given', (done) => {
      const stubbed = sinon.stub(fetch, 'Promise');
      stubbed.returns(Promise.resolve({ json: () => ({ 'access_token': 1, login: 'user1' }) }));
      request(app)
        .get('/login?code=1&targetPath=/home')
        .set('accept', '*/*')
        .expect(302)
        .expect('Location', '/home', done);
    });

    it('should redirect to error page when account doen\'t exist', (done) => {
      const stubbed = sinon.stub(fetch, 'Promise');
      stubbed.returns(Promise.resolve({ json: () => ({ 'access_token': 1, login: 'user11' }) }));
      request(app)
        .get('/login?code=1&targetPath=home')
        .set('accept', '*/*')
        .expect(400)
        .expect(/Oops../, done);
    });

    it('should redirect to home page if auth error occurs', (done) => {
      const stubbed = sinon.stub(fetch, 'Promise');
      stubbed.returns(Promise.resolve({ json: () => ({ 'access_token': 1, login: 'user1' }) }));
      request(app)
        .get('/login?error=errorMsg')
        .set('accept', '*/*')
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
        .set('accept', '*/*')
        .expect(302)
        .expect('Location', '/signUpForm?targetPath=/home', done);
    });

    it('should redirect to error page if user exists', (done) => {
      const stubbed = sinon.stub(fetch, 'Promise');
      stubbed.returns(Promise.resolve({
        json: () =>
          ({ 'access_token': 1, login: 'user1', avatar_url: 'avatar' })
      }));
      request(app)
        .get('/signUp?code=1&targetPath=home')
        .set('accept', '*/*')
        .expect(409)
        .expect(/Oops../, done);
    });

    it('should redirect to home page if auth error occurs', (done) => {
      request(app)
        .get('/signUp?error=errorMsg')
        .set('accept', '*/*')
        .expect(302)
        .expect('Location', '/home', done);
    });
  });

  context('/signUpForm', () => {
    it('should serve signUp page when the person is new user', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('2');
      app.locals.sessions = sessions;
      request(app)
        .get('/signUpForm')
        .set('accept', '*/*')
        .set('Cookie', `session=${id}`)
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow \| Sign Up/, done);
    });

    it('should give unauthorized when the user is not authorized', (done) => {
      request(app)
        .get('/signUpForm')
        .set('accept', '*/*')
        .expect(401, done);
    });
  });

  context('/search', () => {
    it('should serve search page with search result', (done) => {
      request(app)
        .get('/search?searchQuery=foreign')
        .set('accept', '*/*')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow \| Search/, done);
    });
  });
});

describe('POST', function() {
  context('/saveDetails', () => {
    it('should save user details when he is authorized', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('3');
      app.locals.sessions = sessions;
      request(app)
        .post('/saveDetails?targetPath=/home')
        .set('Cookie', `session=${id}`)
        .send('name=Narut&email=john%40email.com&location=Bangalore')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(302)
        .expect('Location', '/home', done);
    });

    it('should not save user details when he is not authorized', (done) => {
      request(app)
        .post('/saveDetails?targetPath=/home')
        .send('name=Narut&email=john%40email.com&location=Bangalore')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(401, done);
    });
  });

  context('/saveQuestion', () => {
    it('should save given valid question', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/saveQuestion')
        .set('Cookie', `session=${id}`)
        .send({ title: 'How to configure vim?', body: '{"ops":[{"insert":"don\'t know about .vimrc"}]}', bodyText: 'bodyText', tags: [] })
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"id":.*}/, done);
    });

    it('should serve unauthorized if not logged in', (done) => {
      request(app)
        .post('/saveQuestion')
        .send({ title: 'title', body: 'body', bodyText: 'bodyText' })
        .set('Content-Type', 'application/json')
        .expect(401, done);
    });
  });

  context('/addVote', () => {
    it('should add question vote when valid ids given', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/addVote')
        .set('Cookie', `session=${id}`)
        .set('Content-Type', 'application/json')
        .send({id: 1, voteType: 1, isQuestionVote: true})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"isSucceeded":true/, done);
    });

    it('should add answer vote when valid ids given', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/addVote')
        .set('Cookie', `session=${id}`)
        .set('Content-Type', 'application/json')
        .send({id: 1, voteType: 1})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"isSucceeded":true/, done);
    });

    it('should produce error when invalid details given', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/addVote')
        .set('Cookie', `session=${id}`)
        .set('Content-Type', 'application/json')
        .send({id: 100, voteType: 100, isQuestionVote: true})
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('{"error":"Vote Addition Failed"}', done);
    });

    it('should serve unauthorized if not logged in', (done) => {
      request(app)
        .post('/addVote')
        .send({id: 1, voteType: 1, isQuestionVote: true})
        .set('Content-Type', 'application/json')
        .expect(401, done);
    });
  });

  context('/deleteVote', () => {
    it('should delete question vote when valid ids given', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('2');
      app.locals.sessions = sessions;
      request(app)
        .post('/deleteVote')
        .set('Cookie', `session=${id}`)
        .set('Content-Type', 'application/json')
        .send({id: 1, isQuestionVote: true})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"isSucceeded":true/, done);
    });

    it('should delete answer vote when valid ids given', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('2');
      app.locals.sessions = sessions;
      request(app)
        .post('/deleteVote')
        .set('Cookie', `session=${id}`)
        .set('Content-Type', 'application/json')
        .send({ id: 1 })
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"isSucceeded":true/, done);
    });

    it('should serve unauthorized if not logged in', (done) => {
      request(app)
        .post('/deleteVote')
        .send({id: 1})
        .set('Content-Type', 'application/json')
        .expect(401, done);
    });
  });

  context('/saveAnswer', () => {
    it('should save given valid answer', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/saveAnswer')
        .set('Cookie', `session=${id}`)
        .send({ body: '{"ops":[{"insert":"User require"}]}', bodyText: 'use require', quesId: 4 })
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('{"isSaved":true}', done);
    });

    it('should serve bad request if wrong details given', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/saveAnswer')
        .set('Cookie', `session=${id}`)
        .send({ body: '{"ops":[{"insert":"User require"}]}', bodyText: 'use require', quesId: 400 })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('{"isSaved":false}', done);
    });

    it('should serve unauthorized if not logged in', (done) => {
      request(app)
        .post('/saveAnswer')
        .send({ body: 'body', bodyText: 'bodyText', quesId: 1 })
        .set('Content-Type', 'application/json')
        .expect(401, done);
    });
  });

  context('/saveComment', () => {
    it('should save given valid comment', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/saveComment')
        .set('Cookie', `session=${id}`)
        .send({ body: 'comment', isQuesionComment: true, id: 1})
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/{"isSucceeded":true/, done);
    });

    it('should serve not acceptable if wrong details given', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/saveComment')
        .set('Cookie', `session=${id}`)
        .send({ body: 'comment', isQuesionComment: true, id: 1000})
        .set('Content-Type', 'application/json')
        .expect(406)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('{"error":"Comment Insertion Failed!"}', done);
    });
  });

  context('/profile', () => {
    it('should serve user\'s profile page when user logged in', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .get('/profile?userId=1')
        .set('Cookie', `session=${id}`)
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/id="editProfileButton"/)
        .expect(/heapOverflow \| Profile/, done);
    });

    it('should serve profile page when asked with valid id', (done) => {
      request(app)
        .get('/profile?userId=1')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow \| Profile/, done);
    });

    it('should serve error page when asked with invalid id', (done) => {
      request(app)
        .get('/profile?userId=34732')
        .expect(404)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow \| Oops/, done);
    });
  });

  context('/editProfile', () => {
    it('should give edit profile page when user asked to edit his own profile', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .get('/editProfile')
        .set('Cookie', `session=${id}`)
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow \| Edit profile/, done);
    });

    it('should serve unauthorized if user asked to edit others profile', (done) => {
      request(app)
        .get('/editProfile')
        .expect(401, done);
    });
  });

  context('/acceptAnswer', () => {
    it('should accept the answer', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/acceptAnswer')
        .set('Cookie', `session=${id}`)
        .send({answerId: 1})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('{"isSucceeded":true}', done);
    });

    it('should not accept if someone else tries to accept', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('2');
      app.locals.sessions = sessions;
      request(app)
        .post('/acceptAnswer')
        .set('Cookie', `session=${id}`)
        .send({answerId: 1})
        .expect(406)
        .expect('Content-Type', /json/)
        .expect(/error/, done);
    });
  });

  context('/rejectAnswer', () => {
    it('should reject the answer', (done) => {
      const sessions = new Sessions();
      const id = sessions.addSession('1');
      app.locals.sessions = sessions;
      request(app)
        .post('/rejectAnswer')
        .set('Cookie', `session=${id}`)
        .send({answerId: 1})
        .expect(200)
        .expect('Content-Type', /json/)
        .expect('{"isSucceeded":true}', done);
    });
  });
});

