const tablesSchema = require('./tablesSchema.json');

const getLastQuestionsSql = () =>
  `select id, title, created, display_name as owner from questions
  LEFT JOIN users
  on questions.owner = users.user_id
  order by created DESC;`;

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

  storeUserDetails(username, avatarUrl, githubUrl) {
    const query = `INSERT INTO USERS (github_username, github_link, avatar) 
    VALUES ("${username}", "${githubUrl}", "${avatarUrl}")`;
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
    const dataArr = Object.values(tablesSchema);

    this.dbClient.serialize(() => {
      this.dbClient.run('BEGIN TRANSACTION;');
      dataArr.forEach(query => {
        this.dbClient.serialize(() => {
          this.dbClient.run(query, err => {
            if (err) {
              throw err;
            }
          });
          this.dbClient.run('PRAGMA foreign_keys=ON;');
        });
      });
      this.dbClient.run('COMMIT;');
    });
  }

  getLastQuestions(count){
    return new Promise((resolve, reject) => {
      this.dbClient.all(getLastQuestionsSql(), (err, rows) => {
        if(err){
          return reject(err);
        }
        resolve(rows.slice(0, count));
      });
    });
  }

  getQuestionDetails(id){
    return new Promise((resolve, reject) => {
      this.dbClient.get(getQuestionDetailsSql(id), (err, details) => {
        if(err){
          return reject(err);
        }
        resolve(details);
      });
    });
  }
}

module.exports = DataStore;
