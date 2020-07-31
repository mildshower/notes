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

const getAnsVoteModificationQuery = () =>
  `update answer_votes
    set vote_type = ?
    where answer_id = ? AND user = ?`;

const getQuesVoteModificationQuery = () =>
  `update question_votes
    set vote_type = ?
    where question_id = ? AND user = ?`;

const getAnswersByUserSql = () => answerDetails + 'where ans.owner = ?';

const getAnswerByQuestionSql = () => answerDetails + 'where ans.question = ?';

const getLastQuestionsSql = () =>
  questionDetails + 'order by ques.created DESC;';

const getQuestionDetailsSql = (id) =>
  questionDetails + `where ques.id = ${id};`;

const getUserQuestionsSql = () => questionDetails + 'where ques.owner = ?;';

const searchQuestionsSql = () =>
  questionDetails +
  'where ques.title like $regExp or ques.body_text like $regExp;';

const getQuestionInsertionSql = () =>
  `insert into questions (title, body, body_text, owner)
    values (?, ?, ?, ?);`;

const getUserInsertionQuery = () =>
  `insert into users (github_username, avatar) 
    values (?, ?);`;

const getTagsInsertionQuery = () =>
  `insert into tags (tag_name)
    values (?);`;

const getTagIdQuery = () =>
  `select id from tags
    where tag_name = ?;`;

const getInsertQuesTagsQuery = () =>
  `insert into questions_tags (tag_id, question_id)
    values(?, ?)`;

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

const getAnswerVoteQuery = () =>
  `select vote_type as voteType
    from answer_votes
    where answer_id = ? AND user = ?`;

const getAnsVoteAdditionQuery = () => 
  `insert into answer_votes (vote_type, answer_id, user)
    values (?, ?, ?)`;

const getQuesVoteAdditionQuery = () => 
  `insert into question_votes (vote_type, question_id, user)
    values (?, ?, ?)`;

const getAnsVoteDeletionQuery = () => 
  `delete from answer_votes
    where answer_id = ? and user = ?`;

const getQuesVoteDeletionQuery = () => 
  `delete from question_votes
    where question_id = ? and user = ?`;

const getAnswerInsertionQuery = () =>
  `insert into answers (body, body_text, question, owner)
    values (?, ?, ?, ?)`;

const getQuestionTagsQuery = () =>
  `select tags.tag_name FROM tags
   left join questions_tags as ques_tags
   on ques_tags.tag_id = tags.id
   where ques_tags.question_id = ?;`;
   
const getVoteCountQuery = contentType =>
  `select COALESCE(sum(REPLACE(vote_type,0,-1)),0) as voteCount
    from ${contentType}_votes
    where ${contentType}_id = ?`;

class DataStore {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  getRows(query, params) {
    return new Promise((resolve, reject) => {
      this.dbClient.all(query, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      });
    });
  }

  runQuery(query, params, rejectionContent){
    return new Promise((resolve, reject) => {
      this.dbClient.run(query, params, err => {
        err && reject(rejectionContent || err);
        resolve();
      });
    });
  }

  getRow(query, params, rejectionContent){
    return new Promise((resolve, reject) => {
      this.dbClient.get(query, params, (err, row) => {
        err && reject(rejectionContent || err);
        resolve(row);
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

  addNewUser(username, avatarUrl) {
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(
          getUserInsertionQuery(),
          [username, avatarUrl],
          (err) => {
            if (err) {
              reject(new Error('User Already Exists!'));
            }
          }
        );
        this.dbClient.get(
          'select last_insert_rowid() as id;',
          (err, details) => {
            if (err) {
              reject(err);
            }
            resolve(details);
          }
        );
      });
    });
  }

  getUser(key, value) {
    const query = `select * from users where ${key} = ?`;
    return this.getRow(
      query,
      [value]
    )
      .then(user => ({ user, isFound: Boolean(user) }));
  }

  updateUserDetails(userId, { name, email, location, bio }) {
    return this.runQuery(
      getUserUpdationQuery(),
      [name, email, location, bio || '', userId]
    );
  }

  getQuestionDetails(id) {
    return this.getRow(getQuestionDetailsSql(id), [])
      .then(details => {
        if(!details) {
          throw new Error('Wrong Id Provided');
        }
        return details;
      });
  }

  getLastQuestions(count) {
    if(count < 0){
      return Promise.reject(new Error('Invalid Count'));
    }
    return this.getRows(getLastQuestionsSql(), [])
      .then(rows => rows.slice(0, count));
  }

  addQuestionContent(question, owner) {
    const { title, body, bodyText } = question;
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(
          getQuestionInsertionSql(),
          [title, body, bodyText, owner],
          (err) => {
            if (err) {
              reject(new Error('Question Insertion Incomplete!'));
            }
          }
        );
        this.dbClient.get(
          'select last_insert_rowid() as id;',
          (err, details) => {
            if (err) {
              reject(err);
            }
            resolve(details);
          }
        );
      });
    });
  }

  getTagId(tagName) {
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(getTagsInsertionQuery(), tagName, () => {});
        this.dbClient.get(getTagIdQuery(), tagName, (err, tag) => {
          err && reject(err);
          resolve(tag);
        });
      });
    });
  }

  async addQuestionTags(questionId, tags) {
    for (let index = 0; index < tags.length; index++) {
      const {id: tagId} = await this.getTagId(tags[index]);
      this.dbClient.run(getInsertQuesTagsQuery(), [tagId, questionId], () => {});
    }
  }

  async addQuestion(question, owner) {
    const qnDetails = await this.addQuestionContent(question, owner);
    await this.addQuestionTags(qnDetails.id, question.tags);
    return qnDetails;
  }

  getUserQuestions(id) {
    return this.getRows(getUserQuestionsSql(), [id]);
  }

  getAnswersByQuestion(id) {
    return this.getRows(getAnswerByQuestionSql(), [id]);
  }

  getMatchedQuestions(text) {
    return this.getRows(searchQuestionsSql(), { $regExp: `%${text}%` });
  }

  getUserAnswers(id) {
    return this.getRows(getAnswersByUserSql(), [id]);
  }

  addAnswer(body, bodyText, quesId, owner) {
    return this.runQuery(
      getAnswerInsertionQuery(),
      [body, bodyText, quesId, owner],
      new Error('Answer Insertion Failed!')
    );
  }

  getVote(contentId, userId, contentType) {
    return new Promise((resolve, reject) => {
      const query =
        contentType === 'answer'
          ? getAnswerVoteQuery()
          : getQuestionVoteQuery();
      this.dbClient.get(query, [contentId, userId], (err, details) => {
        if (err) {
          return reject(new Error('Fetching vote failed'));
        }
        resolve({
          isVoted: Boolean(details),
          voteType: details && details.voteType,
        });
      });
    });
  }

  async getTags(questions) {
    const tags = [];
    for (const question of questions) {
      const newTags = await this.getRows(getQuestionTagsQuery(), question.id);
      tags.push(...newTags.map((tag) => tag.tag_name));
    }
    return [...new Set(tags)];
  }
  
  async addQuestionVote(quesId, userId, voteType){
    const {isVoted} = await this.getVote(quesId, userId, 'question');
    const query = isVoted ? 
      getQuesVoteModificationQuery() : getQuesVoteAdditionQuery();
    await this.runQuery(
      query, 
      [voteType, quesId, userId],
      new Error('Vote Addition Failed')
    );
  }

  deleteQuestionVote(quesId, userId){
    return this.runQuery(
      getQuesVoteDeletionQuery(),
      [quesId, userId],
      new Error('Vote Deletion Failed')
    );
  }

  async addAnswerVote(ansId, userId, voteType){
    const {isVoted} = await this.getVote(ansId, userId, 'answer');
    const query = isVoted ? 
      getAnsVoteModificationQuery() : getAnsVoteAdditionQuery();
    await this.runQuery(
      query, 
      [voteType, ansId, userId],
      new Error('Vote Addition Failed')
    );
  }

  deleteAnswerVote(ansId, userId){
    return this.runQuery(
      getAnsVoteDeletionQuery(),
      [ansId, userId],
      new Error('Vote Deletion Failed')
    );
  }

  getVoteCount(contentType, contentId){
    return new Promise((resolve, reject) => {
      this.dbClient.get(
        getVoteCountQuery(contentType),
        [contentId],
        (err, details) => {
          if(err){
            return reject(new Error('Vote Count Fetching Error'));
          }
          resolve(details.voteCount);
        }
      );
    });
  }
}

module.exports = DataStore;
