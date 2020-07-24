const sinon = require('sinon');
const assert = require('assert');
const DataStore = require('../src/dataStore');

describe('#getQuestionDetails', () => {
  it('it should give details of a question when valid id provided', (done) => {
    const dbClient = {
      get: sinon.fake.yields(null, {title: 'question'})
    };
    const dataStore = new DataStore(dbClient);
    dataStore.getQuestionDetails('1')
      .then(details => {
        assert.deepStrictEqual(details, {title: 'question'});
        assert.ok(dbClient.get.calledOnce);
        assert.ok(dbClient.get.firstArg.match(/ques.id = 1/));
        done();
      });
  });
});
