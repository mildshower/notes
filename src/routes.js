require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const DataStore = require('./dataStore');
const Sessions = require('./sessions');
const dbPath = process.env.HO_DB_PATH || 'data/ho_production.db';
const dbClient = new sqlite3.Database(dbPath);
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

app.locals.dataStore = new DataStore(dbClient);
app.locals.dataStore.init();
app.locals.sessions = new Sessions();

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
app.get('/question', serveQuestionPage);
app.get('/questionDetails', serveQuestionDetails);
app.get('/answers', serveAnswers);
app.get('/tags', getTagsSuggestion);
app.get('/search', serveSearchPage);
app.get('/logout', logout);
app.use(serveNotFound);

module.exports = { app };
