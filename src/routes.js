const express = require('express');

const app = express();

app.get('/', (req, res) => res.redirect('/home'));

app.use(express.static('public'));

app.set('view engine', 'pug');

app.get('/home', (req, res) => res.render('home'));

module.exports = { app };
