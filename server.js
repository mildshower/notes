const sqlite3 = require('sqlite3').verbose();
const DataStore = require('./src/dataStore');
const Sessions = require('./src/sessions');
const dbPath = process.env.HO_DB_PATH || 'data/ho_production.db';
const dbClient = new sqlite3.Database(dbPath);
const knex = require('./src/knexConnection')(dbPath);
const { app } = require('./src/routes');

app.locals.dataStore = new DataStore(dbClient, knex);
app.locals.dataStore.init();
app.locals.sessions = new Sessions();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
