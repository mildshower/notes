require('dotenv').config();
const fetch = require('node-fetch');
const Moment = require('moment');

const getRelativeTime = function(time) {
  return new Moment(time).fromNow();
};

const handleSessions = async (req, res, next) => {
  const sessionId = req.cookies.session;
  const userId = req.app.locals.sessions.getUserId(sessionId);
  const {user} = await req.app.locals.dataStore.getUser('user_id', userId);
  req.user = user;
  next();
};

const serveHomePage = async function(req, res) {
  const { dataStore } = req.app.locals;
  const questionIds = await dataStore.getLastQuestions(10);
  const questions = [];
  for(const questionId of questionIds){
    const question = await dataStore.getQuestionDetails(questionId);
    question.created = getRelativeTime(question.created);
    questions.push(question);
  }
  res.render('home', { user: req.user, title: 'Last 10 Questions', questions, currPath: '/home' });
};

const authenticateWithGithub = (req, res) => {
  const redirectStatusCode = 302;
  res.redirect(
    redirectStatusCode,
    `https://github.com/login/oauth/authorize?client_id=${process.env.HO_CLIENT_ID}&redirect_uri=http://localhost:8000/verify?targetPath=${req.query.targetPath}`
  );
};

const getRedirectUrl = async ({ dataStore, targetPath, userDetails }) => {
  const { login, avatar_url: avatarUrl, url } = userDetails;
  const { isFound } = await dataStore.getUser('github_username', login);
  if (isFound) {
    return { path: targetPath, login };
  }
  await dataStore.addNewUser(login, avatarUrl, url);
  return { path: 'signUp', login };
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

const handleLoginSignUp = async (req, res) => {
  const { dataStore, sessions } = req.app.locals;
  const { targetPath, code, error } = req.query;
  if (error) {
    return res.redirect('/home');
  }

  const userDetails = await getGithubDetails(code);
  const { path, login } = await getRedirectUrl({ dataStore, targetPath, userDetails });
  const { user } = await dataStore.getUser('github_username', login);
  const sessionId = sessions.addSession(user.user_id);
  res.cookie('session', sessionId);
  res.redirect(path);
};

const serveSignUpPage = (req, res) => {
  res.render('signUp');
};

const serveQuestionPage = async function(req, res) {
  const dataStore = req.app.locals.dataStore;
  try{
    const question = await dataStore.getQuestionDetails(req.query.id);
    question.lastModified = getRelativeTime(question.lastModified);
    question.created = getRelativeTime(question.created);
    res.render('question', Object.assign( {user: req.user, currPath: req.originalUrl}, question));
  }catch(error){
    res.status(400).send(error.message);
  }
};

const serveQuestionDetails = function(req, res) {
  req.app.locals.dataStore.getQuestionDetails(req.query.id)
    .then(question => res.json(question));
};

const serveAskQuestion = function(req, res) {
  res.render('askQuestion', {user: req.user});
};

const saveDetails = async (req, res) => {
  const { name, email, location } = req.body;
  await req.app.locals.dataStore.updateUserDetails(req.user.user_id, name, email, location);
  res.redirect('/home');
};

const authorizeUser = function(req, res, next){
  if(req.user) {
    return next();
  }
  res.sendStatus(401);
};

module.exports = {
  handleSessions,
  serveHomePage,
  authenticateWithGithub,
  handleLoginSignUp,
  serveSignUpPage,
  serveAskQuestion,
  serveQuestionPage,
  serveQuestionDetails,
  saveDetails,
  authorizeUser
};
