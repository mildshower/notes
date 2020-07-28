require('dotenv').config();
const fetch = require('node-fetch');
const Moment = require('moment');

const getRelativeTime = function(time) {
  return new Moment(time).fromNow();
};

const handleSessions = async (req, res, next) => {
  const sessionId = req.cookies.session;
  const userId = req.app.locals.sessions.getUserId(sessionId);
  const { user } = await req.app.locals.dataStore.getUser('user_id', userId);
  req.user = user;
  next();
};

const serveHomePage = async function(req, res) {
  const { dataStore } = req.app.locals;
  const questions = await dataStore.getLastQuestions(10);
  questions.forEach(question => {
    question.created = getRelativeTime(question.created);
  });
  res.render('home', { user: req.user, title: 'Last 10 Questions', questions, currPath: '/home' });
};

const authenticateWithGithub = (req, res, next) => {
  if (!['login', 'signUp'].includes(req.query.type)) {
    return next();
  }
  const redirectStatusCode = 302;
  const redirectUri = `http://localhost:8000/${req.query.type}?targetPath=${req.query.targetPath}`;
  res.redirect(
    redirectStatusCode,
    `https://github.com/login/oauth/authorize?client_id=${process.env.HO_CLIENT_ID}&redirect_uri=${redirectUri}`
  );
};

const getOauthOptions = code => {
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
  const response = await fetch('https://github.com/login/oauth/access_token', getOauthOptions(code));
  const { access_token: accessToken } = await response.json();
  const details = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${accessToken}` },
  });
  return await details.json();
};

const isValidVerificationReq = async function(req, res, next) {
  const { dataStore } = req.app.locals;
  if (req.query.error) {
    return res.redirect('/home');
  }
  req.userDetails = await getGithubDetails(req.query.code);
  req.user = (await dataStore.getUser('github_username', req.userDetails.login)).user;
  next();
};

const handleSignUp = async function(req, res) {
  if (req.user) {
    return res.render('error', {
      errorMessage: `It seems Github username ${req.userDetails.login} already has an account.`,
      currPath: '/home'
    });
  }
  const { dataStore, sessions } = req.app.locals;
  const { login, avatar_url: avatarUrl } = req.userDetails;
  const { id: userId } = await dataStore.addNewUser(login, avatarUrl);
  res.cookie('session', sessions.addSession(userId));
  res.redirect(`/signUpForm?targetPath=${req.query.targetPath}`);
};

const handleLogin = function(req, res) {
  if (!req.user) {
    return res.render('error', {
      errorMessage: `It seems there is no account for Github username ${req.userDetails.login}.`,
      currPath: '/home'
    });
  }
  const { sessions } = req.app.locals;
  res.cookie('session', sessions.addSession(req.user.user_id));
  res.redirect(req.query.targetPath);
};

const serveSignUpPage = (req, res) => {
  res.render('signUp', { targetPath: req.query.targetPath });
};

const serveQuestionPage = async function(req, res) {
  const dataStore = req.app.locals.dataStore;
  try {
    const question = await dataStore.getQuestionDetails(req.query.id);
    question.lastModified = getRelativeTime(question.lastModified);
    question.created = getRelativeTime(question.created);
    res.render('question', Object.assign({ user: req.user, currPath: req.originalUrl }, question));
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const serveQuestionDetails = function(req, res) {
  req.app.locals.dataStore.getQuestionDetails(req.query.id)
    .then(question => {
      return res.json(question);
    })
    .catch(error => res.status(400).send(error.message));
};

const serveAskQuestion = function(req, res) {
  res.render('askQuestion', { user: req.user });
};

const saveDetails = async (req, res) => {
  const { name, email, location } = req.body;
  await req.app.locals.dataStore.updateUserDetails(req.user.user_id, name, email, location);
  res.redirect(req.query.targetPath);
};

const saveQuestion = function(req, res) {
  req.app.locals.dataStore.addQuestion(req.body, req.user.user_id)
    .then(insertionDetails => res.json(insertionDetails));
};

const authorizeUser = function(req, res, next) {
  if (req.user) {
    return next();
  }
  res.sendStatus(401);
};

const serveSearchPage = function(req, res) {
  req.app.locals.dataStore.getMatchedQuestions(req.query.searchQuery)
    .then(questions => {
      questions.forEach(question => {
        question.created = getRelativeTime(question.created);
        question.bodyText = question.bodyText.split('\n');
      });
      res.render('search', { questions, currPath: req.originalUrl, user: req.user, searchQuery: req.query.searchQuery, title: 'Searched Results' });
    });
};

const serveNotFound = function(req, res) {
  res.status(404).render('error', {
    errorMessage: `${req.originalUrl} is not a valid path!!`,
    currPath: '/home'
  });
};

const showProfilePage = async (req, res) => {
  const { userId } = req.query;
  const { dataStore } = req.app.locals;
  const { user: requestedUser } = await dataStore.getUser('user_id', userId);
  const { user } = req;
  if (!requestedUser) {
    return res.render('error', {
      user,
      errorMessage: 'We\'re sorry, we couldn\'t find the user you requested.',
      currPath: '/home'
    });
  }
  const questions = await dataStore.getUserQuestions(userId);
  res.render('profile', { requestedUser, user, questions, questionsCount: questions.length, currPath: `/profile?userId=${userId}` });
};

module.exports = {
  handleSessions,
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
  handleLogin,
  handleSignUp,
  serveSearchPage,
  serveNotFound,
  showProfilePage
};
