const express = require('express');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const DataStore = require('./dataStore');
const { handleGithubRequest, handleLoginSignUp } = require('./handlers');
const dbPath = process.env.HO_DB_PATH || 'data/ho_production.db';
const dbClient = new sqlite3.Database(dbPath);

const app = express();

app.locals.dataStore = new DataStore(dbClient);
app.locals.dataStore.init();

app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => res.redirect('/home'));
app.use(express.static('public'));
app.get('/home', (req, res) => res.render('home'));
app.get('/entry', handleGithubRequest);
app.get('/verify', handleLoginSignUp);

module.exports = { app };
