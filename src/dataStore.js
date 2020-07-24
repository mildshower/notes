const tablesSchema = require('./tablesSchema.json');

class DataStore {
  constructor(dbClient) {
    this.dbClient = dbClient;
  }

  getUser(key, value) {
    const query = `SELECT * FROM users WHERE ${key} = "${value}";`;
    return new Promise((resolve, reject) => {
      this.dbClient.get(query, (err, user) => {
        if (err) {
          return reject(err);
        }
        resolve({ user, isFound: Boolean(user) });
      });
    });
  }

  storeUserDetails(username, avatarUrl, githubUrl) {
    const query = `INSERT INTO USERS (github_username, github_link, avatar) 
    VALUES ("${username}", "${githubUrl}", "${avatarUrl}")`;
    return new Promise((resolve, reject) => {
      this.dbClient.run(query, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  init() {
    const dataArr = Object.values(tablesSchema);

    this.dbClient.serialize(() => {
      this.dbClient.run('BEGIN TRANSACTION;');
      dataArr.forEach(query => {
        this.dbClient.serialize(() => {
          this.dbClient.run(query, err => {
            if (err) {
              throw err;
            }
          });
          this.dbClient.run('PRAGMA foreign_keys=ON;');
        });
      });
      this.dbClient.run('COMMIT;');
    });
  }
}

module.exports = DataStore;
