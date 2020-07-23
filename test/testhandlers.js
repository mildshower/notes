const request = require('supertest');
const { app } = require('../src/routes');

describe('GET', () => {
  context('/homepage', () => {
    it('Should get home page for path "/"', done => {
      request(app)
        .get('/')
        .set('Accept', '*/*')
        .expect(302)
        .expect('Location', '/home', done);
    });

    it('Should get home page for path "/home"', done => {
      request(app)
        .get('/home')
        .set('Accept', '*/*')
        .expect(200)
        .expect('Content-Type', /text\/html/)
        .expect(/heapOverflow | Home/, done);
    });

    it('should get the index.css for "css/index.css" path', done => {
      request(app)
        .get('/css/index.css')
        .set('accept', '*/*')
        .expect(200)
        .expect('Content-Type', /text\/css/)
        .expect(/#icon {/, done);
    });
  });
});
