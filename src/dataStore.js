const tablesSchema = require('./tablesSchema.json');

const getLastQuestionsSql = () =>
  'select id from questions order by created DESC;';

const getQuestionDetailsSql = id =>
  `select 
  ques.id, 
  ques.title, 
  ques.body, 
  ques.owner, 
  ques.created, 
  ques.last_modified as lastModified, 
  (select display_name from users 
    where users.user_id = ques.owner) as ownerName, 
  (select count(*) from answers 
    where answers.question = ques.id) as answerCount, 
  (select count(*) from answers ans
    where ans.question = ques.id AND ans.is_accepted = 1) as hasCorrectAnswer, 
  (select sum(REPLACE(vote_type,0,-1)) from question_votes 
    where question_votes.question_id = ques.id) as voteCount 
  from questions ques
  where ques.id = ${id};`;

const getInitiationSql = () => {
  return `
    ${Object.values(tablesSchema).join('\n')}
    PRAGMA foreign_keys=ON;
  `;
};

class DataStore {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  getUser(key, value) {
    const query = `SELECT * FROM users WHERE ${key} = "${value}";`;
    return new Promise((resolve, reject) => {
      this.dbClient.get(query, (err, user) => {
        if (err) {
          return reject(err);
        }
        resolve({ user, isFound: Boolean(user) });
      });
    });
  }

  addNewUser(username, avatarUrl, githubUrl) {
    const query = `INSERT INTO USERS (github_username, github_link, avatar) 
    VALUES ("${username}", "${githubUrl}", "${avatarUrl}")`;
    return new Promise((resolve, reject) => {
      this.dbClient.run(query, err => {
        if (err) {
          return reject(new Error('no user found'));
        }
        resolve();
      });
    });
  }

  updateUserDetails(userId, name, email, location) {
    const query = `UPDATE users
    SET display_name = "${name}", email = "${email}", location = "${location}"
    WHERE user_id = ${userId};`;
    return new Promise((resolve, reject) => {
      this.dbClient.run(query, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  init() {
    return new Promise((resolve, reject) => {
      this.dbClient.exec(getInitiationSql(), err => {
        if(err){
          return reject(err);
        }
        resolve();
      });
    });
  }

  getQuestionDetails(id){
    return new Promise((resolve, reject) => {
      this.dbClient.get(getQuestionDetailsSql(id), (err, details) => {
        if(err || !details){
          return reject(err || new Error('Wrong Id Provided'));
        }
        resolve(details);
      });
    });
  }

  getLastQuestions(count) {
    return new Promise((resolve, reject) => {
      this.dbClient.all(getLastQuestionsSql(), (err, rows) => {
        if (err || count < 0) {
          return reject(err || new Error('Negative count error!'));
        }
        resolve(rows.slice(0, count).map(({id}) => id));
      });
    });
  }
}

module.exports = DataStore;
