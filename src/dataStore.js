const tablesSchema = require('./tablesSchema.json');

const questionDetails = `select 
  ques.id, 
  ques.title, 
  ques.body,
  ques.body_text as bodyText,
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
  from questions ques `;

const answerDetails = `select 
  ans.id, 
  ans.body,
  ans.body_text as bodyText,
  ans.owner, 
  ans.is_accepted as isAccepted,
  ans.question as quesId,
  ans.created,
  ans.last_modified as lastModified, 
  (select display_name from users 
    where users.user_id = ans.owner) as ownerName,   
  (select sum(REPLACE(vote_type,0,-1)) from answer_votes 
    where answer_votes.answer_id = ans.id) as voteCount 
  from answers ans `;

const getAnswerByQuestionSql = () =>
  answerDetails + 'where ans.question = ?';

const getLastQuestionsSql = () =>
  questionDetails + 'order by ques.created DESC;';

const getQuestionDetailsSql = id =>
  questionDetails + `where ques.id = ${id};`;

const getUserQuestionsSql = (id) =>
  questionDetails + `where ques.owner = ${id};`;

const searchQuestionsSql = (text) =>
  questionDetails +
  `where ques.title like "%${text}%" OR ques.body_text like "%${text}%";`;

const getQuestionInsertionSql = () =>
  `insert into questions (title, body, body_text, owner)
    values (?, ?, ?, ?);`;

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

  addNewUser(username, avatarUrl) {
    const query = `INSERT INTO USERS (github_username, avatar) 
    VALUES ("${username}", "${avatarUrl}")`;
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(query, err => {
          if (err) {
            reject(new Error('User Already Exists!'));
          }
        });
        this.dbClient.get(
          'select last_insert_rowid() as id;', 
          (err, details) => {
            resolve(details);
          });
      });
    });
  }

  updateUserDetails(userId, name, email, location) {
    const query = `UPDATE users
    SET display_name = "${name}", email = "${email}", location = "${location}"
    WHERE user_id = ${userId};`;
    return new Promise((resolve) => {
      this.dbClient.run(query, () => {
        resolve();
      });
    });
  }

  init() {
    return new Promise((resolve) => {
      this.dbClient.exec(getInitiationSql(), () => {
        resolve();
      });
    });
  }

  getQuestionDetails(id) {
    return new Promise((resolve, reject) => {
      this.dbClient.get(getQuestionDetailsSql(id), (err, details) => {
        if (err || !details) {
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
        resolve(rows.slice(0, count));
      });
    });
  }

  addQuestion(question, owner) {
    const { title, body, bodyText } = question;
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(getQuestionInsertionSql(),
          [title, body, bodyText, owner],
          err => {
            if(err){
              reject(new Error('Question Insertion Incomplete!'));
            }
          });
        this.dbClient.get(
          'select last_insert_rowid() as id;',
          (err, details) => {
            if (err) {
              reject(err);
            }
            resolve(details);
          });
      });
    });
  }

  getUserQuestions(id) {
    return new Promise((resolve, reject) => {
      this.dbClient.all(getUserQuestionsSql(id), (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  getAnswersByQuestion(id) {
    return new Promise((resolve, reject) => {
      this.dbClient.all(getAnswerByQuestionSql(), [id], (err, answers) => {
        if (err) {
          return reject(err);
        }
        resolve(answers);
      });
    });
  }

  getMatchedQuestions(text) {
    return new Promise((resolve, reject) => {
      this.dbClient.all(searchQuestionsSql(text), (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }
}

module.exports = DataStore;
