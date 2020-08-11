const query = require('./dbQueries');

class DataStore {
  constructor(dbClient, knex) {
    this.dbClient = dbClient;
    this.knex = knex;
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
          query.lastRowId,
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
    return this.knex
      .table('users')
      .select()
      .where(key, '=', value || '')
      .first()
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
          query.lastRowId,
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

  addTag(tagName) {
    return new Promise((resolve, reject) => {
      this.dbClient.serialize(() => {
        this.dbClient.run(query.tagsInsertion, tagName, () => { });
        this.dbClient.get(query.tagIdByTagName, tagName, (err, tag) => {
          err && reject(err);
          resolve(tag);
        });
      });
    });
  }

  async addQuestionTags(questionId, tags) {
    for (let index = 0; index < tags.length; index++) {
      const { id: tagId } = await this.addTag(tags[index]);
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

  getAnswerById(id) {
    return this.getRow(query.answerById, [id])
      .then(details => {
        if (!details) {
          throw new Error('Wrong Id Provided');
        }
        return details;
      });
  }

  getMatchedQuestions(searchKeyword) {
    const [, userName, tagName, acceptance, ansCount, text] =
      searchKeyword.match(/^@(.*)|^#(.*)|^:(.*)|^>(.*)|(.*)/);
    const expressions = {
      $text: `%${text}%`,
      $user: `%${userName}%`,
      $tag: `%${tagName}%`,
      $acceptance: acceptance && +/^accepted$/i.test(acceptance),
      $ansCount: +ansCount
    };
    return this.getRows(query.searchQuestions, expressions);
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

  async getQuestionTags(questionId) {
    const tags = await this.getRows(query.questionTags, questionId);
    return tags.map((tag) => tag.tag_name);
  }

  async addVote(id, userId, voteType, isQuesVote) {
    const { isVoted } = await this.getVote(id, userId, isQuesVote);
    const voteQueries = isQuesVote ?
      query.quesVote : query.ansVote;
    const chosenQuery = isVoted ? voteQueries.toggle : voteQueries.addition;
    await this.runQuery(
      chosenQuery,
      [voteType, id, userId],
      new Error('Vote Addition Failed')
    );
  }

  deleteVote(id, userId, isQuesVote) {
    return this.runQuery(
      isQuesVote ? query.quesVoteDeletion : query.ansVoteDeletion,
      [id, userId],
      new Error('Vote Deletion Failed')
    );
  }

  getVoteCount(id, isQuesVote) {
    return this.getRow(
      isQuesVote ? query.questionVoteCount : query.answerVoteCount,
      [id],
      new Error('Vote Count Fetching Error')
    );
  }

  rejectAnswer(id) {
    return this.knex
      .table('answers')
      .update('is_accepted', 0)
      .where('id', '=', id)
      .catch(() => {
        throw new Error('Answer rejection failed');
      });
  }

  acceptAnswer(id) {
    return this.knex
      .table('answers')
      .select('question')
      .where('id', '=', id)
      .first('question')
      .then(({ question }) =>
        this.knex
          .table('answers')
          .update('is_accepted',
            this.knex.raw(`case id when ${id} then 1 else 0 END`))
          .where('question', '=', question)
          .catch(() => {
            throw new Error('Could not accept the answer');
          })
      );
  }

  getComments(id, isQuestion) {
    return this.getRows(
      isQuestion ? query.questionComments : query.answerComments,
      [id]
    );
  }

  getPopularTags(exp, count) {
    return this.knex
      .select('tag_name')
      .count('*', { as: 'popularity' })
      .from('questions_tags')
      .leftJoin('tags', 'tags.id', 'questions_tags.tag_id')
      .where('tag_name', 'like', `%${exp}%`)
      .groupBy('tag_id')
      .orderBy('popularity', 'desc')
      .pluck('tag_name')
      .limit(count);
  }

  saveComment({ body, owner, creationTime, id }, isQuestionComment) {
    const commentOn = isQuestionComment ? 'question' : 'answer';
    const comment = {
      body, owner, created: creationTime,
      'last_modified': creationTime, [commentOn]: id
    };
    return this.knex
      .table(commentOn + '_comments')
      .insert(comment)
      .catch(() => {
        throw new Error('Comment Insertion Failed!');
      });
  }
}

module.exports = DataStore;
