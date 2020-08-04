const query = require('./dbQueries');

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

  runQuery(query, params, rejectionContent) {
    return new Promise((resolve, reject) => {
      this.dbClient.run(query, params, err => {
        err && reject(rejectionContent || err);
        resolve();
      });
    });
  }

  getRow(query, params, rejectionContent) {
    return new Promise((resolve, reject) => {
      this.dbClient.get(query, params, (err, row) => {
        err && reject(rejectionContent || err);
        resolve(row);
      });
    });
  }

  init() {
    return new Promise((resolve) => {
      this.dbClient.exec(query.initial, () => {
        resolve();
      });
    });
  }

  addNewUser(username, avatarUrl) {
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(
          query.userInsertion,
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
      query.userUpdation,
      [name, email, location, bio || '', userId]
    );
  }

  getQuestionDetails(id) {
    return this.getRow(query.questionDetails, [id])
      .then(details => {
        if (!details) {
          throw new Error('Wrong Id Provided');
        }
        return details;
      });
  }

  getLastQuestions(count) {
    if (count < 0) {
      return Promise.reject(new Error('Invalid Count'));
    }
    return this.getRows(query.lastQuestions, [])
      .then(rows => rows.slice(0, count));
  }

  addQuestionContent(question, owner) {
    const { title, body, bodyText } = question;
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(
          query.questionInsertion,
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
        this.dbClient.run(query.tagsInsertion, tagName, () => {});
        this.dbClient.get(query.tagIdByTagName, tagName, (err, tag) => {
          err && reject(err);
          resolve(tag);
        });
      });
    });
  }

  async addQuestionTags(questionId, tags) {
    for (let index = 0; index < tags.length; index++) {
      const { id: tagId } = await this.getTagId(tags[index]);
      this.dbClient.run(query.insertQuesTags, [tagId, questionId], () => { });
    }
  }

  async addQuestion(question, owner) {
    const qnDetails = await this.addQuestionContent(question, owner);
    await this.addQuestionTags(qnDetails.id, question.tags);
    return qnDetails;
  }

  getUserQuestions(id) {
    return this.getRows(query.userQuestions, [id]);
  }

  getAnswersByQuestion(id) {
    return this.getRows(query.answerByQuestion, [id]);
  }

  getMatchedQuestions(searchText) {
    const [, userName, tagName, text] = searchText.match(/(^:.*)?(^#.*)?(.*)?/);
    let searchQuery = query.searchQuestionsByText;
    let searchExp = text;
    if (userName) {
      searchQuery = query.searchQuestionsByUserName;
      searchExp = userName.slice(1);
    }
    if (tagName) {
      searchQuery = query.searchQuestionsByTagName;
      searchExp = tagName.slice(1);
    }
    return this.getRows(searchQuery, { $regExp: `%${searchExp}%` });
  }

  getUserAnswers(id) {
    return this.getRows(query.answersByUser, [id]);
  }

  addAnswer(body, bodyText, quesId, owner) {
    return this.runQuery(
      query.answerInsertion,
      [body, bodyText, quesId, owner],
      new Error('Answer Insertion Failed!')
    );
  }

  getVote(id, userId, isQuesVote) {
    return this.getRow(
      isQuesVote ? query.questionVoteByUser : query.answerVoteByUser,
      [id, userId],
      new Error('Fetching vote failed')
    ).then(details => ({
      isVoted: Boolean(details),
      voteType: details && details.voteType,
    }));
  }

  async getTags(questions) {
    const tags = [];
    for (const question of questions) {
      const newTags = await this.getRows(query.questionTags, question.id);
      tags.push(...newTags.map((tag) => tag.tag_name));
    }
    return [...new Set(tags)];
  }
  
  async addVote(id, userId, voteType, isQuesVote){
    const {isVoted} = await this.getVote(id, userId, isQuesVote);
    const voteQueries = isQuesVote ?
      query.voteQueries.ques : query.voteQueries.ans;
    const chosenQuery = isVoted ? voteQueries.toggle : voteQueries.addition;
    await this.runQuery(
      chosenQuery, 
      [voteType, id, userId],
      new Error('Vote Addition Failed')
    );
  }

  deleteVote(id, userId, isQuesVote){
    return this.runQuery(
      isQuesVote ? query.quesVoteDeletion : query.ansVoteDeletion,
      [id, userId],
      new Error('Vote Deletion Failed')
    );
  }

  getVoteCount(id, isQuesVote){
    return this.getRow(
      isQuesVote ? query.questionVoteCount : query.answerVoteCount,
      [id],
      new Error('Vote Count Fetching Error')
    );
  }

  rejectAnswer(id){
    return this.runQuery(
      query.rejectAnswer,
      [id],
      new Error('Rejection failed')
    );
  }
}

module.exports = DataStore;
