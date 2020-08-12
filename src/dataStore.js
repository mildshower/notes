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

  addNewUser(userName, avatar) {
    return this.knex
      .table('users')
      .insert({ 'github_username': userName, avatar })
      .then(([id]) => ({ id }))
      .catch(() => {
        throw new Error('User Already Exists!');
      });
  }

  getUser(key, value) {
    return this.knex
      .table('users')
      .select()
      .where(key, value || '')
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
    return this.knex
      .table('questions')
      .insert({ title, body, 'body_text': bodyText, owner })
      .then(([id]) => ({ id }))
      .catch(() => {
        throw new Error('Question Insertion Incomplete!');
      });
  }

  getTagId(tagName) {
    return this.knex
      .select('id')
      .from('tags')
      .where('tag_name', tagName)
      .first();
  }

  async addTag(tagName) {
    const tag = await this.getTagId(tagName);
    if (tag) {
      return tag;
    }
    return this.knex
      .table('tags')
      .insert({ 'tag_name': tagName })
      .then(([id]) => ({ id }));
  }

  async addQuestionTags(questionId, tags) {
    for (let index = 0; index < tags.length; index++) {
      const { id: tagId } = await this.addTag(tags[index]);
      await this.knex
        .table('questions_tags')
        .insert({ 'tag_id': tagId, 'question_id': questionId });
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
    return this.knex
      .table('answers')
      .insert({ body, 'body_text': bodyText, question: quesId, owner })
      .catch(() => {
        throw new Error('Answer Insertion Failed!');
      });
  }

  getVote(id, userId, isQuesVote) {
    const voteOf = isQuesVote ? 'question' : 'answer';
    return this.knex
      .select({ voteType: 'vote_type' })
      .from(`${voteOf}_votes`)
      .where(`${voteOf}_id`, id)
      .andWhere('user', userId)
      .first()
      .then(details => ({
        isVoted: Boolean(details),
        voteType: details && details.voteType
      }));
  }

  getQuestionTags(questionId) {
    return this.knex
      .select('tags.tag_name')
      .from('tags')
      .leftJoin({ quesTags: 'questions_tags' }, 'quesTags.tag_id', 'tags.id')
      .where('quesTags.question_id', questionId)
      .pluck('tag_name');
  }

  updateVote(id, userId, voteType, voteOf) {
    return this.knex
      .table(`${voteOf}_votes`)
      .update('vote_type', voteType)
      .where(`${voteOf}_id`, id)
      .andWhere('user', userId)
      .catch(() => {
        throw new Error('Vote Updation Failed');
      });
  }

  addNewVote(id, userId, voteType, voteOf) {
    return this.knex
      .table(`${voteOf}_votes`)
      .insert({ 'vote_type': voteType, [`${voteOf}_id`]: id, user: userId })
      .catch(() => {
        throw new Error('Vote Addition Failed');
      });
  }

  async addVote(id, userId, voteType, isQuesVote) {
    const { isVoted } = await this.getVote(id, userId, isQuesVote);
    const voteOf = isQuesVote ? 'question' : 'answer';
    if (isVoted) {
      return this.updateVote(id, userId, voteType, voteOf);
    }
    return this.addNewVote(id, userId, voteType, voteOf);
  }

  deleteVote(id, userId, isQuesVote) {
    const voteOf = isQuesVote ? 'question' : 'answer';
    return this.knex
      .table(`${voteOf}_votes`)
      .where(`${voteOf}_id`, id)
      .andWhere('user', userId)
      .del()
      .catch(() => {
        throw new Error('Vote Deletion Failed');
      });
  }

  getVoteCount(id, isQuesVote) {
    const voteOf = isQuesVote ? 'question' : 'answer';
    return this.knex
      .select(
        this.knex.raw('COALESCE(sum(REPLACE(vote_type,0,-1)),0) as voteCount')
      )
      .from(`${voteOf}_votes`)
      .where(`${voteOf}_id`, id)
      .first()
      .catch(() => {
        throw new Error('Vote Count Fetching Error');
      });
  }

  rejectAnswer(id) {
    return this.knex
      .table('answers')
      .update('is_accepted', 0)
      .where('id', id)
      .catch(() => {
        throw new Error('Answer rejection failed');
      });
  }

  acceptAnswer(id) {
    return this.knex
      .table('answers')
      .select('question')
      .where('id', id)
      .first('question')
      .then(({ question }) =>
        this.knex
          .table('answers')
          .update('is_accepted',
            this.knex.raw(`case id when ${id} then 1 else 0 END`))
          .where('question', question)
          .catch(() => {
            throw new Error('Could not accept the answer');
          })
      );
  }

  getComments(id, isQuestion) {
    const commentsOf = isQuestion ? 'question' : 'answer';
    return this.knex
      .select('comments.*', { ownerName: 'users.display_name' })
      .from({ comments: commentsOf + '_comments' })
      .leftJoin('users', 'users.id', 'comments.owner')
      .where(`comments.${commentsOf}`, id);
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
