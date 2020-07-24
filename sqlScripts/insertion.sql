PRAGMA foreign_keys = ON;


INSERT INTO users (user_id, github_username, display_name, location, email, bio, github_link, role, avatar)
  VALUES 
   ("1","user1", "john", "India", "user1@gmail.com",NULL,"http://github.com/user1","user","https://avatars1.githubusercontent.com/u/58025792?v=4"),
   ("2","user2", "dev", "UK", "dev@yahoo.co.in","developing altime",NULL,"moderator","https://avatars1.githubusercontent.com/u/58025792?v=4"),
   ("3","user3", "cany", "China", "can221@yahoo.co.in",NULL,NULL,"user","https://avatars1.githubusercontent.com/u/58025792?v=4");


INSERT INTO questions (id,title, body, body_text, owner, created)
  VALUES 
   (1,'How to use foreign key in sqlite3?','{"ops":[{"insert":"I am unable to use foreign key in sqlite3."}]}', 'I am unable to use foreign key in sqlite3.', 1, '2020-07-24 19:06:49'),
   (2,'Why node js is single threaded?','{"ops":[{"insert":"I am using node version 12"}]}', 'I am using node version 12', 3, '2020-07-24 19:06:39');



INSERT INTO answers (id, body, body_text, question, owner, is_accepted)
  VALUES 
   (1,'{"ops":[{"insert":"Use PRAGMA foreign_keys = ON in sqlite3"}]}', 'Use PRAGMA foreign_keys = ON in sqlite3',1,3, 1),
   (2,'{"ops":[{"insert":"You cant use"}]}', 'You cant use', 1, 2, 0);




INSERT INTO question_comments (id, body, owner,question)
  VALUES 
   (1,'nice question', 3, 1),
   (2,'I am also facing same problem', 3, 1),
   (3,'Please provide some code snippet', 2, 1);



INSERT INTO answer_comments (id, body, owner, answer)
  VALUES 
   (1,'Thanks for the answer!', 1, 1),
   (2,'Welcome', 3, 1);



INSERT INTO tags (id,tag_name)
  VALUES 
   (1,"sqlite3"),
   (2,"foreign_key"),
   (3,"node"),
   (4,"asynchronous");


INSERT INTO questions_tags (tag_id,question_id)
  VALUES 
   (1, 1),
   (2, 1),
   (3, 2),
   (4, 2);




INSERT INTO question_votes (question_id,user,vote_type)
  VALUES 
   (1, 2, 1),
   (1, 3, 1),
   (2, 2, 0);




INSERT INTO answer_votes (answer_id,user,vote_type)
  VALUES 
   (1, 1, 1),
   (1, 2, 1),
   (2, 1, 0);



