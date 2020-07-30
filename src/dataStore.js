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
  (select COALESCE(sum(REPLACE(vote_type,0,-1)),0) from question_votes 
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
  (select title from questions 
    where questions.id = ans.question) as questionTitle,  
  (select COALESCE(sum(REPLACE(vote_type,0,-1)),0) from answer_votes 
    where answer_votes.answer_id = ans.id) as voteCount 
  from answers ans `;

const getUserUpdationQuery = () =>
  `UPDATE users
    SET display_name = ?, email = ?, location = ?, bio = ?
    WHERE user_id = ?;`;

const getAnswersByUserSql = () =>
  answerDetails + 'where ans.owner = ?';

const getAnswerByQuestionSql = () =>
  answerDetails + 'where ans.question = ?';

const getLastQuestionsSql = () =>
  questionDetails + 'order by ques.created DESC;';

const getQuestionDetailsSql = id =>
  questionDetails + `where ques.id = ${id};`;

const getUserQuestionsSql = () =>
  questionDetails + 'where ques.owner = ?;';

const searchQuestionsSql = () =>
  questionDetails +
  'where ques.title like $regExp OR ques.body_text like $regExp;';

const getQuestionInsertionSql = () =>
  `insert into questions (title, body, body_text, owner)
    values (?, ?, ?, ?);`;

const getUserInsertionQuery = () =>
  `INSERT INTO USERS (github_username, avatar) 
    VALUES (?, ?)`;

const getInitiationSql = () => {
  return `
    ${Object.values(tablesSchema).join('\n')}
    PRAGMA foreign_keys=ON;
  `;
};

const getQuestionVoteQuery = () =>
  `select vote_type as voteType
    from question_votes
    where question_id = ? AND user = ?`;

const getAnswerInsertionQuery = () =>
  `insert into answers (body, body_text, question, owner)
    values (?, ?, ?, ?)`;

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
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(
          getUserInsertionQuery(),
          [username, avatarUrl],
          err => {
            if (err) {
              reject(new Error('User Already Exists!'));
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

  updateUserDetails(userId, { name, email, location, bio}) {
    return new Promise((resolve) => {
      this.dbClient.run(
        getUserUpdationQuery(),
        [name, email, location, bio || '', userId],
        () => {
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
    return this.getRows(getUserQuestionsSql(), [id]);
  }

  getAnswersByQuestion(id) {
    return this.getRows(getAnswerByQuestionSql(), [id]);
  }

  getMatchedQuestions(text) {
    return this.getRows(searchQuestionsSql(), {$regExp: `%${text}%`});
  }

  getRows(query, params){
    return new Promise((resolve, reject) => {
      this.dbClient.all(query, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  getUserAnswers(id){
    return this.getRows(getAnswersByUserSql(), [id]);
  }

  addAnswer(body, bodyText, quesId, owner){
    return new Promise((resolve, reject) => {
      this.dbClient.run(
        getAnswerInsertionQuery(),
        [body, bodyText, quesId, owner],
        (err) => {
          if (err) {
            return reject(new Error('Answer Insertion Failed!'));
          }
          resolve();
        });
    });
  }

  getQuestionVote(questionId, userId){
    return new Promise((resolve, reject) => {
      this.dbClient.get(
        getQuestionVoteQuery(),
        [questionId, userId],
        (err, details) => {
          if(err){
            return reject(new Error('Fetching vote failed'));
          }
          resolve(
            {isVoted: Boolean(details), voteType: details && details.voteType}
          );
        }
      );
    });
  }
}

module.exports = DataStore;
