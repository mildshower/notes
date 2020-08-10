const knex = require('knex');

const getKnexOptions = (dbPath) => knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath
  },
  useNullAsDefault: true
});

module.exports = getKnexOptions;
