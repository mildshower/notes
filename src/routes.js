require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const DataStore = require('./dataStore');
const Sessions = require('./sessions');
const dbPath = process.env.HO_DB_PATH || 'data/ho_production.db';
const dbClient = new sqlite3.Database(dbPath);
const {
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
  rejectAnswer
} = require('./handlers');

const app = express();

app.locals.dataStore = new DataStore(dbClient);
app.locals.dataStore.init();
const session = new Sessions();
session.addSession('1');
app.locals.sessions = session;//new Sessions();

app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(handleSessions);
app.get('/', (req, res) => res.redirect('/home'));
app.use(express.static('public'));
app.get('/home', serveHomePage);
app.get('/entry', authenticateWithGithub);
app.get('/login', isValidVerificationReq, handleLogin);
app.get('/signUp', isValidVerificationReq, handleSignUp);
app.get('/profile', showProfilePage);
app.get('/question', serveQuestionPage);
app.get('/questionDetails', serveQuestionDetails);
app.get('/answers', serveAnswers);
app.get('/search', serveSearchPage);
app.get('/editProfile', authorizeUser, serveEditProfilePage);
app.get('/signUpForm', authorizeUser, serveSignUpPage);
app.get('/askQuestion', authorizeUser, serveAskQuestion);
app.post('/saveDetails', authorizeUser, saveDetails);
app.post('/saveQuestion', authorizeUser, saveQuestion);
app.post('/saveAnswer', authorizeUser, saveAnswer);
app.post('/addVote', authorizeUser, addVote);
app.post('/deleteVote', authorizeUser, deleteVote);
app.post('/acceptAnswer', authorizeUser, acceptAnswer);
app.post('/rejectAnswer', authorizeUser, rejectAnswer);
app.use(serveNotFound);

module.exports = { app };
