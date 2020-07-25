PRAGMA foreign_keys = ON;


INSERT INTO users (user_id, github_username, display_name, location, email, bio, github_link, role, avatar)
  VALUES 
   (1,"user1", "john", "India", "user1@gmail.com",NULL,"http://github.com/user1","user","https://avatars1.githubusercontent.com/u/58025792?v=4"),
   (2,"user2", "dev", "UK", "dev@yahoo.co.in","developing altime",NULL,"moderator","https://avatars1.githubusercontent.com/u/58025792?v=4"),
   (3,"user3", "cany", "China", "can221@yahoo.co.in",NULL,NULL,"user","https://avatars1.githubusercontent.com/u/58025792?v=4"),
   (4,"user4", "moozoo", "America", "moozoo221@yahoo.co.in",NULL,NULL,"user","https://avatars1.githubusercontent.com/u/58025792?v=4");


INSERT INTO questions (id,title, body, body_text, owner, created)
  VALUES 
   (1,'How to use foreign key in sqlite3?','{"ops":[{"insert":"I am unable to use foreign key in sqlite3."}]}', 'I am unable to use foreign key in sqlite3.', 1, '2020-07-24 19:06:49'),
   (2,'Why node js is single threaded?','{"ops":[{"insert":"I am using node version 12"}]}', 'I am using node version 12', 3, '2020-07-24 19:06:39'),
   (3,'How do I get started with Node.js?','{"ops":[{"insert":"Are there any good resources to get started with Node.JS? Any good tutorials, blogs or books?"}]}', 
   'Are there any good resources to get started with Node.JS? Any good tutorials, blogs or books?', 2, '2020-07-25 15:03:19'),
   (4,'How do I include a JavaScript file in another JavaScript file?',
   '{"ops":[{"insert":"Is there something in JavaScript similar to @import in CSS that allows you to include a JavaScript file inside another JavaScript file?"}]}',
    'Is there something in JavaScript similar to @import in CSS that allows you to include a JavaScript file inside another JavaScript file?',
     4, '2020-07-24 07:37:42'),
   (5,'Accessing the index in for loops?','{"ops":[{"insert":"How do I access the index in a for loop like the following?"}]}',
    'How do I access the index in a for loop like the following?', 3, '2020-07-21 03:12:14'),
   (6,'Can I hide the HTML5 number input’s spin box?','{"ops":[{"attributes":{"color":"#242729"},"insert":"Is there a consistent way across browsers to hide the new spin boxes that some browsers (such as Chrome) render for HTML input of type number? I am looking for a CSS or JavaScript method to prevent the up/down arrows from appearing."},{"insert":"\n<input id=\"test\" type=\"number\">"},{"attributes":{"code-block":true},"insert":"\n"}]}',
    'Is there a consistent way across browsers to hide the new spin boxes that some browsers (such as Chrome) render for HTML input of type number? I am looking for a CSS or JavaScript method to prevent the up/down arrows from appearing.<input id="test" type="number">',
 1, '2020-07-22 19:06:39'),
  (7,'How do I pass command line arguments to a Node.js program? ','{"ops":[{"insert":"I have a web server written in node.js and I would like to launch with a specific folder. I am not sure how to access arguments in JavaScript. I am running node like this:\n$ node server.js folder"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"here server.js is my server code. node.js help says this is possible:\n$ node -h"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"Usage: node [options] script.js [arguments]"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"How would I access those arguments in JavaScript? Somehow I was not able to find this information on the web.\n"}]} ', 'I have a web server written in node.js and I would like to launch with a specific folder. I am not sure how to access arguments in JavaScript. I am running node like this:
$ node server.js folder
here server.js is my server code. node.js help says this is possible:
$ node -h
Usage: node [options] script.js [arguments]
How would I access those arguments in JavaScript? Somehow I was not able to find this information on the web. ', 3, '2020-07-24 19:06:39');



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



