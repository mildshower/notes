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
    where users.id = ques.owner) as ownerName, 
  (select avatar from users 
    where users.id = ques.owner) as ownerAvatar,
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
    where users.id = ans.owner) as ownerName,
  (select avatar from users 
    where users.id = ans.owner) as ownerAvatar,
  (select title from questions 
    where questions.id = ans.question) as questionTitle,  
  (select COALESCE(sum(REPLACE(vote_type,0,-1)),0) from answer_votes 
    where answer_votes.answer_id = ans.id) as voteCount 
  from answers ans `;

module.exports = {
  userUpdation:
    `UPDATE users
    SET display_name = ?, email = ?, location = ?, bio = ?
    WHERE id = ?;`,

  answersByUser: answerDetails + 'where ans.owner = ?',

  answerByQuestion:
    answerDetails + 'where ans.question = ? ORDER BY isAccepted DESC',

  lastQuestions:
    questionDetails + 'order by ques.created DESC;',

  questionDetails:
    questionDetails + 'where ques.id = ?;',

  userQuestions: questionDetails + 'where ques.owner = ?;',

  searchQuestions:
    questionDetails +
    ` where ques.title like $text or ques.body_text like $text
    or ownerName like $user
    or ques.id in (select question_id from questions_tags
      where tag_id = (select id from tags where tag_name like $tag))
    or hasCorrectAnswer = $acceptance
    or answerCount = $ansCount;`,

  questionInsertion:
    `insert into questions (title, body, body_text, owner)
    values (?, ?, ?, ?);`,

  userInsertion:
    `insert into users (github_username, avatar) 
    values (?, ?);`,

  tagsInsertion:
    `insert into tags (tag_name)
    values (?);`,

  tagIdByTagName:
    `select id from tags
    where tag_name = ?;`,

  insertQuesTags:
    `insert into questions_tags (tag_id, question_id)
    values(?, ?)`,

  initial: `
    ${Object.values(tablesSchema).join('\n')}
    PRAGMA foreign_keys=ON;
  `,

  questionVoteByUser:
    `select vote_type as voteType
    from question_votes
    where question_id = ? AND user = ?`,

  answerVoteByUser:
    `select vote_type as voteType
    from answer_votes
    where answer_id = ? AND user = ?`,

  quesVote: {
    addition: `insert into question_votes (vote_type, question_id, user)
      values (?, ?, ?)`,
    toggle: `update question_votes
      set vote_type = ?
      where question_id = ? AND user = ?`
  },
  ansVote: {
    addition: `insert into answer_votes (vote_type, answer_id, user)
      values (?, ?, ?)`,
    toggle: `update answer_votes
      set vote_type = ?
      where answer_id = ? AND user = ?`
  },

  ansVoteDeletion:
    `delete from answer_votes
    where answer_id = ? and user = ?`,

  quesVoteDeletion:
    `delete from question_votes
    where question_id = ? and user = ?`,

  answerInsertion:
    `insert into answers (body, body_text, question, owner)
    values (?, ?, ?, ?)`,

  answerById:
    answerDetails + 'where ans.id = ?',

  lastRowId: 'select last_insert_rowid() as id;'
};
