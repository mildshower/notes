const tablesSchema = `create table if not exists users (
  user_id integer primary key AUTOINCREMENT,
  github_username varchar(40) not null,
  display_name varchar(50) DEFAULT 'USER',
  location varchar(40),
  email varchar(50),
  bio varchar(100),
  github_link varchar(80),
  role varchar(10) not null DEFAULT 'user',
  avatar varchar(30) not null,
  CHECK (role = 'user' OR role = 'moderator')
);

create table if not exists questions (
  id integer primary key AUTOINCREMENT,
  title varchar(200) not null,
  body varchar(500) not null,
  body_text varchar(500) not null,
  owner integer not null,
  created timestamp not null DEFAULT (datetime('now','localtime')),
  last_modified timestamp not null DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (owner)
    REFERENCES users (user_id)
);

create table if not exists answers (
  id integer primary key AUTOINCREMENT,
  body varchar(500) not null,
  body_text varchar(500) not null,
  question integer not null,
  owner integer not null,
  created timestamp not null DEFAULT (datetime('now','localtime')),
  last_modified timestamp not null DEFAULT (datetime('now','localtime')),
  is_accepted integer not null DEFAULT 0,
  FOREIGN KEY (owner)
    REFERENCES users (user_id),
  FOREIGN KEY (question)
    REFERENCES questions (id),
    CHECK(is_accepted=0 OR is_accepted = 1)
);

create table if not exists question_comments (
  id integer primary key AUTOINCREMENT,
  body varchar(100) not null,
  owner integer not null,
  question integer not null,
  created timestamp not null DEFAULT (datetime('now','localtime')),
  last_modified timestamp not null DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (owner)
    REFERENCES users (user_id),
  FOREIGN KEY (question)
    REFERENCES questions (id)
);

create table if not exists answer_comments (
  id integer primary key AUTOINCREMENT,
  body varchar(100) not null,
  owner integer not null,
  answer integer not null,
  created timestamp not null DEFAULT (datetime('now','localtime')),
  last_modified timestamp not null DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (owner)
    REFERENCES users (user_id),
  FOREIGN KEY (answer)
    REFERENCES answers (id)
);

create table if not exists tags (
  id integer primary key AUTOINCREMENT,
  tag_name varchar(30) not null unique
);

create table if not exists questions_tags (
  tag_id integer not null,
  question_id integer not null,
  FOREIGN KEY (tag_id)
    REFERENCES tags (id),
  FOREIGN KEY (question_id)
    REFERENCES questions (id),
  PRIMARY KEY (tag_id, question_id)
);

create table if not exists question_votes (
  question_id integer not null,
  user integer not null,
  vote_type integer not null,
  FOREIGN KEY (user)
    REFERENCES users (user_id),
  FOREIGN KEY (question_id)
    REFERENCES questions (id),
  CHECK(vote_type=0 OR vote_type = 1),
  PRIMARY KEY (question_id, user)
);

create table if not exists answer_votes (
  answer_id integer not null,
  user integer not null,
  vote_type integer not null,
  FOREIGN KEY (user)
    REFERENCES users (user_id),
  FOREIGN KEY (answer_id)
    REFERENCES answers (id),
  CHECK(vote_type=0 OR vote_type = 1),
  PRIMARY KEY (answer_id, user)
);
`;

module.exports = { tablesSchema };
