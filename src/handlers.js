require('dotenv').config();
const fetch = require('node-fetch');
const Moment = require('moment');

const getRelativeTime = function(time) {
  return new Moment(time).fromNow();
};

const getOauthOptions = (code) => {
  return {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `client_id=${process.env.HO_CLIENT_ID}&client_secret=${process.env.HO_CLIENT_SECRET}&code=${code}`,
  };
};

const getGithubDetails = async (code) => {
  const response = await fetch(
    'https://github.com/login/oauth/access_token',
    getOauthOptions(code)
  );
  const { access_token: accessToken } = await response.json();
  const details = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${accessToken}` },
  });
  return await details.json();
};

const prepareAnswers = async function(answers, user, dataStore) {
  for (const answer of answers) {
    answer.created = getRelativeTime(answer.created);
    answer.userVote =
      user && await dataStore.getVote(answer.id, user.id);
    answer.comments = await dataStore.getComments(answer.id);
    answer.comments.forEach(comment => {
      comment.created = getRelativeTime(comment.created);
    });
  }
  return answers;
};

const prepareQuestion = async function(question, user, dataStore) {
  question.userVote =
    user && await dataStore.getVote(question.id, user.id, true);
  const answers = await dataStore.getAnswersByQuestion(question.id);
  question.answers = await prepareAnswers(answers, user, dataStore);
  question.tags = await dataStore.getQuestionTags(question.id);
  question.created = getRelativeTime(question.created);
  question.comments = await dataStore.getComments(question.id, true);
  question.comments.forEach(comment => {
    comment.created = getRelativeTime(comment.created);
  });
  return question;
};

const getAllUniqueTags = async function(dataStore, questions) {
  const tags = [];
  for (const question of questions) {
    const questionTags = await dataStore.getQuestionTags(question.id);
    tags.push(...questionTags);
  }
  return [...new Set(tags)];
};

const attachUser = (req, res, next) => {
  const sessionId = req.cookies.session;
  const userId = req.app.locals.sessions.getUserId(sessionId);
  req.app.locals.dataStore.getUser('id', userId)
    .then(({ user }) => {
      req.user = user;
      next();
    });
};

const serveHomePage = async function(req, res) {
  const { dataStore } = req.app.locals;
  const questions = await dataStore.getLastQuestions(10);
  for (const question of questions) {
    question.created = getRelativeTime(question.created);
    question.tags = await dataStore.getQuestionTags(question.id);
  }
  res.render('home', {
    user: req.user,
    title: 'Latest Questions',
    questions,
    currPath: '/home',
  });
};

const authenticateWithGithub = (req, res, next) => {
  if (!['login', 'signUp'].includes(req.query.type)) {
    return next();
  }
  const redirectStatusCode = 302;
  const redirectUri = `${process.env.HO_BASE_URL}/${req.query.type}?targetPath=${req.query.targetPath}`;
  res.redirect(
    redirectStatusCode,
    `https://github.com/login/oauth/authorize?client_id=${process.env.HO_CLIENT_ID}&redirect_uri=${redirectUri}`
  );
};

const isValidVerificationReq = async function(req, res, next) {
  const { dataStore } = req.app.locals;
  if (req.query.error) {
    return res.redirect('/home');
  }
  req.userDetails = await getGithubDetails(req.query.code);
  req.enteringUser = (
    await dataStore.getUser('github_username', req.userDetails.login)
  ).user;
  next();
};

const handleSignUp = async function(req, res, next) {
  if (req.enteringUser) {
    req.responseStatus = 409;
    req.errorMessage = `It seems Github username ${req.userDetails.login} already has an account.`;
    return next();
  }
  const { dataStore, sessions } = req.app.locals;
  const { login, avatar_url: avatarUrl } = req.userDetails;
  const { id: userId } = await dataStore.addNewUser(login, avatarUrl);
  res.cookie('session', sessions.addSession(userId));
  res.redirect(`/user/signUpForm?targetPath=${req.query.targetPath}`);
};

const handleLogin = function(req, res, next) {
  if (!req.enteringUser) {
    req.responseStatus = 400;
    req.errorMessage = `It seems there is no account for Github username ${req.userDetails.login}.`;
    return next();
  }
  const { sessions } = req.app.locals;
  res.cookie('session', sessions.addSession(req.enteringUser.id));
  res.redirect(req.query.targetPath);
};

const serveSignUpPage = (req, res) => {
  res.render('signUp', { targetPath: req.query.targetPath });
};

const serveQuestionPage = async function(req, res, next) {
  const dataStore = req.app.locals.dataStore;
  try {
    let question = await dataStore.getQuestionDetails(req.query.id);
    question = await prepareQuestion(question, req.user, dataStore);
    res.render(
      'question',
      Object.assign({ user: req.user, currPath: req.originalUrl }, question)
    );
  } catch (error) {
    req.errorMessage = 'I\'m sorry! Couldn\'t found question with the given id';
    next();
  }
};

const serveQuestionDetails = function(req, res) {
  req.app.locals.dataStore
    .getQuestionDetails(req.query.id)
    .then((question) => {
      return res.json(question);
    })
    .catch((error) => res.status(404).json({ error: error.message }));
};

const serveAnswers = function(req, res) {
  req.app.locals.dataStore
    .getAnswersByQuestion(req.query.id)
    .then((answers) => {
      res.json(answers);
    });
};

const serveAskQuestion = function(req, res) {
  res.render('askQuestion', { user: req.user });
};

const saveDetails = (req, res) => {
  req.app.locals.dataStore.updateUserDetails(req.user.id, req.body)
    .then(() => res.redirect(req.query.targetPath));
};

const saveQuestion = (req, res) => {
  const { dataStore } = req.app.locals;
  const question = req.body;
  dataStore.addQuestion(
    question,
    req.user.id
  ).then(insertionDetails => res.json(insertionDetails));
};

const authorizeUser = function(req, res, next) {
  if (req.user) {
    return next();
  }
  res.status(401).render('error', {
    errorMessage: 'You are Unauthorized',
    currPath: '/home',
  });
};

const serveSearchPage = async function(req, res) {
  const { dataStore } = req.app.locals;
  const questions = await dataStore.getMatchedQuestions(req.query.searchQuery);

  for (const question of questions) {
    question.created = getRelativeTime(question.created);
    question.bodyText = question.bodyText.split('\n');
    question.tags = await dataStore.getQuestionTags(question.id);
  }
  res.render('search', {
    questions,
    currPath: req.originalUrl,
    user: req.user,
    searchQuery: req.query.searchQuery,
    title: 'Searched Results',
  });
};

const serveNotFound = function(req, res) {
  res.status(req.responseStatus || 404).render('error', {
    user: req.user,
    errorMessage:
      req.errorMessage || `${req.originalUrl} is not a valid path!!`,
    currPath: '/home',
  });
};

const showProfilePage = async (req, res, next) => {
  const { userId } = req.params;
  const { dataStore } = req.app.locals;
  const { user: requestedUser } = await dataStore.getUser('id', userId);
  if (!requestedUser) {
    req.errorMessage = 'We\'re sorry, we couldn\'t find the user you requested.';
    return next();
  }
  const questions = await dataStore.getUserQuestions(userId);
  const answers = await dataStore.getUserAnswers(userId);
  const tags = await getAllUniqueTags(dataStore, questions);
  res.render('profile', { requestedUser, user: req.user, questions, tags, answers, currPath: `/profile/${userId}` });
};

const saveAnswer = function(req, res) {
  const { body, bodyText, quesId } = req.body;
  req.app.locals.dataStore
    .addAnswer(body, bodyText, quesId, req.user.id)
    .then(() => res.json({ isSaved: true }))
    .catch(() => res.status(400).json({ isSaved: false }));
};

const serveEditProfilePage = (req, res) => {
  res.render('editProfile', { user: req.user });
};

const addVote = (req, res) => {
  const { voteType, id, isQuestionVote } = req.body;
  const { dataStore } = req.app.locals;
  dataStore.addVote(id, req.user.id, voteType, isQuestionVote)
    .then(() => dataStore.getVoteCount(id, isQuestionVote))
    .then(({ voteCount }) => res.json({ isSucceeded: true, voteCount }))
    .catch(err => res.status(400).json({ error: err.message }));
};

const deleteVote = (req, res) => {
  const { id, isQuestionVote } = req.body;
  const { dataStore } = req.app.locals;
  dataStore.deleteVote(id, req.user.id, isQuestionVote)
    .then(() => dataStore.getVoteCount(id, isQuestionVote))
    .then(({ voteCount }) => res.json({ isSucceeded: true, voteCount }));
};

const acceptAnswer = (req, res) => {
  req.app.locals.dataStore.acceptAnswer(req.body.answerId)
    .then(() => res.json({ isSucceeded: true }));
};

const rejectAnswer = (req, res) => {
  req.app.locals.dataStore.rejectAnswer(req.body.answerId)
    .then(() => res.json({ isSucceeded: true }));
};

const verifyAnswerAcceptance = async function(req, res, next) {
  try {
    const { dataStore } = req.app.locals;
    const { quesId } = await dataStore.getAnswerById(req.body.answerId);
    const { owner } = await dataStore.getQuestionDetails(quesId);
    if (owner !== req.user.id) {
      throw new Error('Not applicable for answer acceptance');
    }
    next();
  } catch (err) {
    res.status(406).json({ error: err.message });
  }
};

const getTagsSuggestion = function(req, res) {
  const { exp } = req.query;
  req.app.locals.dataStore.getPopularTags(exp)
    .then(tags => res.json(Array.from(tags, (tag) => tag.tag_name).slice(0, 10)));
};

const saveComment = function(req, res) {
  const { id, body, isQuestionComment } = req.body;
  const { id: owner, display_name: ownerName } = req.user;
  const creationTime = Moment().format('YYYY-MM-DD HH:mm:ss');
  const created = getRelativeTime(creationTime);
  const comment = { id, body, owner, ownerName, creationTime, created };
  req.app.locals.dataStore.saveComment(comment, isQuestionComment)
    .then(() => res.json({ isSucceeded: true, comment }))
    .catch(err => res.status(406).json({ error: err.message }));
};

const deleteAnswer = function(req, res) {
  const { id } = req.body;
  const { dataStore } = req.app.locals;
  dataStore.deleteAnswer(id)
    .then(() => res.json({ isSucceeded: true }))
    .catch(err => res.status(406).json({ error: err.message }));
};

const logout = function(req, res) {
  req.app.locals.sessions.clearSession(req.cookies.session);
  res.clearCookie('session').redirect('/home');
};

module.exports = {
  attachUser,
  serveHomePage,
  authenticateWithGithub,
  serveSignUpPage,
  serveAskQuestion,
  serveQuestionPage,
  serveQuestionDetails,
  saveDetails,
  authorizeUser,
  saveQuestion,
  isValidVerificationReq,
  handleSignUp,
  handleLogin,
  serveSearchPage,
  serveNotFound,
  showProfilePage,
  serveAnswers,
  saveAnswer,
  serveEditProfilePage,
  addVote,
  deleteVote,
  acceptAnswer,
  rejectAnswer,
  verifyAnswerAcceptance,
  getTagsSuggestion,
  saveComment,
  deleteAnswer,
  logout
};
