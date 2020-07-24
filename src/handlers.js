require('dotenv').config();
const fetch = require('node-fetch');
const Moment = require('moment');

const getRelativeTime = function(time) {
  return new Moment(time).fromNow();
};

const handleSessions = (req, res, next) => {
  const sessionId = req.cookies.session;
  if (sessionId) {
    req.userId = req.app.locals.sessions.getUserId(+sessionId);
  }
  next();
};

const serveHomePage = async function(req, res) {
  const { dataStore } = req.app.locals;
  const { user, isFound } = await dataStore.getUser('user_id', req.userId);
  const questions = await dataStore.getLastQuestions(10);
  questions.forEach(question => {
    question.created = getRelativeTime(question.created);
  });
  res.render('home', { user, isFound, title: 'Last 10 Questions', questions });
};

const authenticateWithGithub = (req, res) => {
  const redirectStatusCode = 302;
  res.redirect(
    redirectStatusCode,
    `https://github.com/login/oauth/authorize?client_id=${process.env.HO_CLIENT_ID}&redirect_uri=http://localhost:8000/verify?targetPath=${req.query.targetPath}`
  );
};

const getRedirectUrl = ({ dataStore, targetPath, userDetails }) => {
  const { login, avatar_url: avatarUrl, url } = userDetails;
  return new Promise((resolve, reject) => {
    dataStore.getUser('github_username', login)
      .then(({ isFound }) => {
        if (isFound) {
          return resolve({ path: targetPath, login });
        }
        dataStore.storeUserDetails(login, avatarUrl, url)
          .then(() => resolve({ path: 'signUp', login }))
          .catch(err => {
            throw err;
          });
      })
      .catch(err => reject(err));
  });
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

const getGithubDetails = (code) => {
  return new Promise((resolve) => {
    fetch('https://github.com/login/oauth/access_token', getOauthOptions(code))
      .then((response) => response.json())
      .then(({ access_token: accessToken }) =>
        fetch('https://api.github.com/user', {
          headers: { Authorization: `token ${accessToken}` },
        })
      )
      .then((response) => response.json())
      .then(resolve);
  });
};

const handleLoginSignUp = (req, res) => {
  const { dataStore, sessions } = req.app.locals;
  const { targetPath, code, error } = req.query;
  if (error) {
    return res.redirect('/home');
  }
  getGithubDetails(code)
    .then((userDetails) => getRedirectUrl({ dataStore, targetPath, userDetails }))
    .then(({ path, login }) => {
      dataStore.getUser('github_username', login)
        .then(({ user }) => {
          const sessionId = sessions.addSession(user.user_id);
          res.cookie('session', sessionId);
          res.redirect(`/${path}`);
        });
    });
};

const serveSignUpPage = (req, res) => {
  res.render('signUp');
};

const serveQuestionPage = async function(req, res) {
  const dataStore = req.app.locals.dataStore;
  const question = await dataStore.getQuestionDetails(req.query.id);
  question.lastModified = getRelativeTime(question.lastModified);
  question.created = getRelativeTime(question.created);
  res.render('question', question);
};

const serveQuestionDetails = function(req, res) {
  req.app.locals.dataStore.getQuestionDetails(req.query.id)
    .then(question => res.json(question));
};

const serveAskQuestion = function(req, res) {
  res.render('askQuestion');
};

const saveDetails = (req, res) => {
  const { name, email, location } = req.body;
  req.app.locals.dataStore.updateUserDetails(req.userId, name, email, location)
    .then(() => {
      res.redirect('/home');
    })
    .catch(err => {
      throw err;
    });
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
  saveDetails 
};
