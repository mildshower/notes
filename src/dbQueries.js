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
  (select avatar from users 
    where users.user_id = ques.owner) as ownerAvatar,
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
  (select avatar from users 
    where users.user_id = ans.owner) as ownerAvatar,
  (select title from questions 
    where questions.id = ans.question) as questionTitle,  
  (select COALESCE(sum(REPLACE(vote_type,0,-1)),0) from answer_votes 
    where answer_votes.answer_id = ans.id) as voteCount 
  from answers ans `;

const commentDetails = 
`SELECT
  comments.*,
  (SELECT display_name from users
  where user_id = comments.owner) as ownerName`;

module.exports = {
  userUpdation:
  `UPDATE users
    SET display_name = ?, email = ?, location = ?, bio = ?
    WHERE user_id = ?;`,

  answersByUser: answerDetails + 'where ans.owner = ?',

  answerByQuestion: 
  answerDetails + 'where ans.question = ? ORDER BY isAccepted DESC',

  lastQuestions:
  questionDetails + 'order by ques.created DESC;',

  questionDetails:
  questionDetails + 'where ques.id = ?;',

  userQuestions: questionDetails + 'where ques.owner = ?;',

  searchQuestionsByText:
  questionDetails +
  'where ques.title like $regExp or ques.body_text like $regExp;',

  searchQuestionsByUserName:
  questionDetails +
  'where ownerName like $regExp;',

  searchQuestionsByTagName:
  questionDetails +
  'where ques.id in (select question_id from questions_tags ' +
  'where tag_id = (select id from tags where tag_name like $regExp));',

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

  voteQueries: {
    ques: {
      addition: `insert into question_votes (vote_type, question_id, user)
      values (?, ?, ?)`,
      toggle: `update question_votes
      set vote_type = ?
      where question_id = ? AND user = ?`
    },
    ans: {
      addition: `insert into answer_votes (vote_type, answer_id, user)
      values (?, ?, ?)`,
      toggle: `update answer_votes
      set vote_type = ?
      where answer_id = ? AND user = ?`
    }
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

  questionTags:
  `select tags.tag_name FROM tags
   left join questions_tags as ques_tags
   on ques_tags.tag_id = tags.id
   where ques_tags.question_id = ?;`,

  questionVoteCount:
  `select COALESCE(sum(REPLACE(vote_type,0,-1)),0) as voteCount
    from question_votes
    where question_id = ?`,

  answerVoteCount:
  `select COALESCE(sum(REPLACE(vote_type,0,-1)),0) as voteCount
    from answer_votes
    where answer_id = ?`,

  rejectAnswer:
  `update answers
    set is_accepted = 0
    where id = ?`,

  acceptAnswer:
  `UPDATE answers
  set is_accepted = 
    case id
      when $ansId then 1
      else 0
    END
  where question = (select question from answers where id = $ansId );`,

  answerById:
  answerDetails + 'where ans.id = ?',

  questionComments:
  commentDetails + ` from question_comments comments
   where comments.question = ? `,

  answerComments:
   commentDetails + ` from answer_comments comments
    where comments.answer = ? `,
  
  popularTags :
  `select tag_name,
      count(*) as popularity
  from questions_tags qt
  left join tags
  on tags.id = qt.tag_id
  where tag_name like $regExp
  group by tag_id
  order by popularity desc;`
};
