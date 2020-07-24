const fetch = require('node-fetch');
const Moment = require('moment');

const getRelativeTime = function(time){
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
  const {dataStore} = req.app.locals;
  const { user, isFound } = await dataStore.getUser('user_id', req.userId);
  const questions = await dataStore.getLastQuestions(10);
  questions.forEach(question => {
    question.created = getRelativeTime(question.created);
  });
  res.render('home', { user, isFound, title: 'Last 10 Questions', questions});
};

const handleGithubRequest = (req, res) => {
  const redirectStatusCode = 302;
  res.redirect(
    redirectStatusCode,
    `https://github.com/login/oauth/authorize?client_id=${process.env.HO_CLIENT_ID}&redirect_uri=http://localhost:8000/verify?targetPath=${req.query.targetPath}`
  );
};

const getRedirectUrl = ({ dataStore, targetPath, userDetails }) => {
  const { login, avatar_url, url } = userDetails;
  return new Promise((resolve, reject) => {
    dataStore.getUser('github_username', login)
      .then(({ isFound }) => {
        if (isFound) {
          return resolve(targetPath);
        }
        dataStore.storeUserDetails(login, avatar_url, url)
          .then(() => resolve('signUp'))
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
  return new Promise((resolve, reject) => {
    fetch('https://github.com/login/oauth/access_token', getOauthOptions(code))
      .then((response) => response.json())
      .then(({ access_token }) =>
        fetch('https://api.github.com/user', {
          headers: { Authorization: `token ${access_token}` },
        })
      )
      .then((response) => response.json())
      .then(resolve);
  });
};

const handleLoginSignUp = (req, res) => {
  if (req.query.error) {
    return res.redirect('/home');
  }

  getGithubDetails(req.query.code)
    .then((userDetails) => {
      const { dataStore, sessions } = req.app.locals;
      const { targetPath } = req.query;
      getRedirectUrl({ dataStore, targetPath, userDetails })
        .then((path) => {
          dataStore.getUser('github_username', userDetails.login)
            .then(({ user }) => {
              const sessionId = sessions.addSession(user.user_id);
              res.cookie('session', sessionId);
              res.redirect(`/${path}`);
            });
        });
    });
};

const serveSignUpPage = (req, res) => {
  res.render('signUp');
};

const serveAskQuestion = function(req, res) {
  res.render('askQuestion');
};

module.exports = { handleSessions, serveHomePage, handleGithubRequest, handleLoginSignUp, serveSignUpPage, serveAskQuestion };
