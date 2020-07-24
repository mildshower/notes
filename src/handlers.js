const fetch = require('node-fetch');

const handleSessions = (req, res, next) => {
  const sessionId = req.cookies.session;
  if (sessionId) {
    req.userId = req.app.locals.sessions.getUserId(+sessionId);

  }
  next();
};

const serveHomePage = (req, res) => {
  req.app.locals.dataStore.getUser('user_id', req.userId)
    .then(({ user, isFound }) => {
      if (isFound) {
        return res.render('home', { avatarUrl: user.avatar });
      }
      res.render('home');
    });
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
          resolve({ path: targetPath, avatarUrl: avatar_url });
          return;
        }
        dataStore.storeUserDetails(login, avatar_url, url);
        resolve({ path: 'signUp', avatarUrl: '' });
      })
      .catch(err => {
        reject(err);
      });
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

const handleLoginSignUp = (req, res) => {
  if (req.query.error) {
    return res.redirect('/home');
  }

  fetch('https://github.com/login/oauth/access_token', getOauthOptions(req.query.code))
    .then((response) => response.json())
    .then(({ access_token }) =>
      fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${access_token}` },
      })
    )
    .then((response) => response.json())
    .then((userDetails) => {
      const { dataStore, sessions } = req.app.locals;
      const { targetPath } = req.query;
      getRedirectUrl({ dataStore, targetPath, userDetails })
        .then(({ path, avatarUrl }) => {
          dataStore.getUser('github_username', userDetails.login)
            .then(({ user }) => {
              const sessionId = sessions.addSession(user.user_id);
              res.cookie('session', sessionId);
              res.render(`${path}`, { avatarUrl });
            });
        });
    });
};

const serveAskQuestion = function(req, res){
  res.render('askQuestion');
};

module.exports = { handleSessions, serveHomePage, handleGithubRequest, handleLoginSignUp, serveAskQuestion };
