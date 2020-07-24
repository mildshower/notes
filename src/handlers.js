const fetch = require('node-fetch');

const handleGithubRequest = (req, res) => {
  const redirectStatusCode = 302;
  res.redirect(
    redirectStatusCode,
    `https://github.com/login/oauth/authorize?client_id=${process.env.HO_CLIENT_ID}&redirect_uri=http://localhost:8000/verify?targetPath=${req.query.targetPath}`
  );
};

const getRedirectUrl = function({ dataStore, targetPath, userDetails }) {
  const { login, avatar_url, url } = userDetails;
  return new Promise((resolve, reject) => {
    dataStore.getUser(login)
      .then(({ user, isFound }) => {
        if (isFound) {
          resolve({ name: user.display_name, path: targetPath, imageUrl: avatar_url });
          return;
        }
        dataStore.storeUserDetails(login, avatar_url, url);
        resolve({ name: '', path: 'signUp', imageUrl: '' });
      })
      .catch(err => {
        reject(err);
      });
  });
};

const handleLoginSignUp = (req, res) => {
  if (req.query.error) {
    return res.redirect('/home');
  }

  fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `client_id=${process.env.HO_CLIENT_ID}&client_secret=${process.env.HO_CLIENT_SECRET}&code=${req.query.code}`,
  })
    .then((response) => {
      return response.json();
    })
    .then(({ access_token }) =>
      fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${access_token}` },
      })
    )
    .then((response) => response.json())
    .then((userDetails) => {
      const { dataStore } = req.app.locals;
      const { targetPath } = req.query;
      getRedirectUrl({ dataStore, targetPath, userDetails })
        .then(({ name, path, imageUrl }) => {
          res.render(`${path}`, { name, imageUrl });
        });
    });
};

module.exports = { handleGithubRequest, handleLoginSignUp };
