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
  handleLoginSignUp, 
  serveSignUpPage, 
  serveAskQuestion, 
  serveQuestionPage, 
  serveQuestionDetails, 
  saveDetails,
  authorizeUser
} = require('./handlers');

const app = express();

app.locals.dataStore = new DataStore(dbClient);
app.locals.dataStore.init();
app.locals.sessions = new Sessions();

app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(handleSessions);
app.get('/', (req, res) => res.redirect('/home'));
app.use(express.static('public'));
app.get('/home', serveHomePage);
app.get('/entry', authenticateWithGithub);
app.get('/verify', handleLoginSignUp);
app.get('/question', serveQuestionPage);
app.get('/questionDetails', serveQuestionDetails);
app.use(authorizeUser);
app.get('/signUp', serveSignUpPage);
app.get('/askQuestion', serveAskQuestion);
app.post('/saveDetails', saveDetails);

module.exports = { app };
