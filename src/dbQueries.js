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

module.exports.userUpdation =
  `UPDATE users
    SET display_name = ?, email = ?, location = ?, bio = ?
    WHERE user_id = ?;`;

module.exports.ansVoteToggle =
  `update answer_votes
    set vote_type = ?
    where answer_id = ? AND user = ?`;

module.exports.quesVoteToggle = 
  `update question_votes
    set vote_type = ?
    where question_id = ? AND user = ?`;

module.exports.answersByUser = answerDetails + 'where ans.owner = ?';

module.exports.answerByQuestion = answerDetails + 'where ans.question = ?';

module.exports.lastQuestions = 
  questionDetails + 'order by ques.created DESC;';

module.exports.questionDetails =
  questionDetails + 'where ques.id = ?;';

module.exports.userQuestions = questionDetails + 'where ques.owner = ?;';

module.exports.searchQuestions = 
  questionDetails +
  'where ques.title like $regExp or ques.body_text like $regExp;';

module.exports.questionInsertion = 
  `insert into questions (title, body, body_text, owner)
    values (?, ?, ?, ?);`;

module.exports.userInsertion =
  `insert into users (github_username, avatar) 
    values (?, ?);`;

module.exports.tagsInsertion = 
  `insert into tags (tag_name)
    values (?);`;

module.exports.tagIdByTagName =
  `select id from tags
    where tag_name = ?;`;

module.exports.insertQuesTags =
  `insert into questions_tags (tag_id, question_id)
    values(?, ?)`;

module.exports.initial = `
    ${Object.values(tablesSchema).join('\n')}
    PRAGMA foreign_keys=ON;
  `;

module.exports.questionVoteByUser =
  `select vote_type as voteType
    from question_votes
    where question_id = ? AND user = ?`;

module.exports.answerVoteByUser =
  `select vote_type as voteType
    from answer_votes
    where answer_id = ? AND user = ?`;

module.exports.ansVoteAddition = 
  `insert into answer_votes (vote_type, answer_id, user)
    values (?, ?, ?)`;

module.exports.quesVoteAddition =
  `insert into question_votes (vote_type, question_id, user)
    values (?, ?, ?)`;

module.exports.ansVoteDeletion = 
  `delete from answer_votes
    where answer_id = ? and user = ?`;

module.exports.quesVoteDeletion =
  `delete from question_votes
    where question_id = ? and user = ?`;

module.exports.answerInsertion =
  `insert into answers (body, body_text, question, owner)
    values (?, ?, ?, ?)`;

module.exports.questionTags =
  `select tags.tag_name FROM tags
   left join questions_tags as ques_tags
   on ques_tags.tag_id = tags.id
   where ques_tags.question_id = ?;`;
   
module.exports.questionVoteCount =
  `select COALESCE(sum(REPLACE(vote_type,0,-1)),0) as voteCount
    from question_votes
    where question_id = ?`;

module.exports.answerVoteCount =
  `select COALESCE(sum(REPLACE(vote_type,0,-1)),0) as voteCount
    from answer_votes
    where answer_id = ?`;