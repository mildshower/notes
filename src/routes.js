const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const userRoute = require('./userRoutes');

const {
  attachUser,
  serveHomePage,
  authenticateWithGithub,
  serveQuestionPage,
  serveQuestionDetails,
  isValidVerificationReq,
  handleSignUp,
  handleLogin,
  serveSearchPage,
  serveNotFound,
  showProfilePage,
  serveAnswers,
  getTagsSuggestion,
  logout
} = require('./handlers');

const app = express();

app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(attachUser);
app.get('/', (req, res) => res.redirect('/home'));
app.use(express.static('public'));
app.use('/user', userRoute);
app.get('/home', serveHomePage);
app.get('/entry', authenticateWithGithub);
app.get('/login', isValidVerificationReq, handleLogin);
app.get('/signUp', isValidVerificationReq, handleSignUp);
app.get('/profile/:userId', showProfilePage);
app.get('/question/:quesId', serveQuestionPage);
app.get('/questionDetails', serveQuestionDetails);
app.get('/answers', serveAnswers);
app.get('/tags', getTagsSuggestion);
app.get('/search', serveSearchPage);
app.get('/logout', logout);
app.use(serveNotFound);

module.exports = { app };
