const { tablesSchema } = require('./tablesSchema');

class DataStore {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  getUser(key, value) {
    const query = `SELECT * FROM users WHERE ${key} = "${value}";`;
    return new Promise((resolve, reject) => {
      this.dbClient.get(query, (err, user) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ user, isFound: Boolean(user) });
      });
    });
  }

  async storeUserDetails(username, avatarUrl, githubUrl) {
    const query = `INSERT INTO USERS (github_username, github_link, avatar) 
    VALUES ("${username}", "${githubUrl}", "${avatarUrl}")`;
    await this.dbClient.run(query, err => {
      if (err) {
        throw err;
      }
    });
  }

  init() {
    const dataArr = tablesSchema.trim().split(');');

    this.dbClient.serialize(() => {
      this.dbClient.run('BEGIN TRANSACTION;');
      dataArr.forEach(query => {
        let table = query;
        if (table) {
          table += ');';
          this.dbClient.serialize(() => {
            this.dbClient.run(table, err => {
              if (err) {
                throw err;
              }
            });
            this.dbClient.run('PRAGMA foreign_keys=ON;');
          });
        }
      });
      this.dbClient.run('COMMIT;');
    });

  }
}

module.exports = DataStore;
