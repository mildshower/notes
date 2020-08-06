PRAGMA foreign_keys = ON;
INSERT INTO users (id, github_username, display_name, location, email, bio, role, avatar)
  VALUES 
   (1,"mildshower", "Sid", "India", "sudipta.kundu@thoughtworks","I Love Coding..","user","https://avatars1.githubusercontent.com/u/58025792?v=4"),
   (2,"user2", "dev", "UK", "dev099@yahoo.co.in","developing altime","moderator","https://nurserylive.com/images/stories/virtuemart/product/nurserylive-tulip-seadov-red-bulbs.jpg"),
   (3,"user3", "cany", "China", "can221@yahoo.co.in",NULL,"user","https://static01.nyt.com/images/2019/09/27/multimedia/27xp-spiderman/27xp-spiderman-superJumbo.jpg"),
   (4,"user4", "moozoo", "America", "moozoo621@yahoo.co.in","Software developer with experience in MVC, C# and SQL Server","user","https://akm-img-a-in.tosshub.com/sites/btmt/images/stories/shaktiman_505_310320050700.jpg?size=1200:675"),
   (5,"user5", "john", "China", "john01111@gmail.com","Exploring the world of Mobile and Web Development.","user","https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/220px-Sunflower_sky_backdrop.jpg"),
   (6,"user6", "joe", "spain", "joe394@yahoo.co.in","developing altime","moderator","https://nurserylive.com/images/stories/virtuemart/product/nurserylive-tulip-seadov-red-bulbs.jpg"),
   (7,"user7", "tom", "USA", "tom39292@gmail.com",NULL,"user","https://static01.nyt.com/images/2019/09/27/multimedia/27xp-spiderman/27xp-spiderman-superJumbo.jpg"),
   (8,"user8", "alex", "America", "alex@yahoo.co.in","I am a software development holic. I feel myself above the sky and feel that I am superman whenever I write code. ","user","https://akm-img-a-in.tosshub.com/sites/btmt/images/stories/shaktiman_505_310320050700.jpg?size=1200:675"),
   (9,"user9", "walker", "russia", "walker9002@yahoo.co.in","Not a C # guru yet but want to be one someday","user","https://static01.nyt.com/images/2019/09/27/multimedia/27xp-spiderman/27xp-spiderman-superJumbo.jpg"),
   (10,"user10", "willie", "hong kong", "willie1222@yahoo.co.in","Passionate about Python,performance, JavaScript and NodeJS.","moderator","https://akm-img-a-in.tosshub.com/sites/btmt/images/stories/shaktiman_505_310320050700.jpg?size=1200:675");


INSERT INTO questions (id,title, body, body_text, owner, created, last_modified)
  VALUES 
   (1,'How to use foreign key in sqlite3 ? I am putting foreign constrain but it is not stopping from inserting values that goes against foreign key constrain.','{"ops":[{"insert":"I made schema like:\ncreate table if not exists questions ("},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  id integer primary key AUTOINCREMENT,"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  title varchar(200) not null,"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  body varchar(1000) not null,"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  body_text varchar(1000) not null,"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  owner integer not null,"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  created timestamp not null DEFAULT (datetime(\"now\",\"localtime\")),"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  last_modified timestamp not null DEFAULT (datetime(\"now\",\"localtime\")),"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    FOREIGN KEY (owner)"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    REFERENCES users (id)"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":");"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"But when trying to insert some data in the table,\nIt is not stopping me from doing that while user table does not have id 1.\n\n"}]}', 'I made schema like:
create table if not exists questions (
  id integer primary key AUTOINCREMENT,
  title varchar(200) not null,
  body varchar(1000) not null,
  body_text varchar(1000) not null,
  owner integer not null,
  created timestamp not null DEFAULT (datetime("now","localtime")),
  last_modified timestamp not null DEFAULT (datetime("now","localtime")),
    FOREIGN KEY (owner)
    REFERENCES users (id)
);
But when trying to insert some data in the table,
It is not stopping me from doing that while user table does not have id 1.', 1, '2020-07-24 19:06:49','2020-07-28 12:01:10'),
  (2,'How do I pass command line arguments to a Node.js program? ','{"ops":[{"insert":"I have a web server written in node.js and I would like to launch with a specific folder. I am not sure how to access arguments in JavaScript. I am running node like this:\n$ node server.js folder"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"here server.js is my server code. node.js help says this is possible:\n$ node -h"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"Usage: node [options] script.js [arguments]"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"How would I access those arguments in JavaScript? Somehow I was not able to find this information on the web.\n"}]} ', 'I have a web server written in node.js and I would like to launch with a specific folder. I am not sure how to access arguments in JavaScript. I am running node like this:
$ node server.js folder
here server.js is my server code. node.js help says this is possible:
$ node -h
Usage: node [options] script.js [arguments]
How would I access those arguments in JavaScript? Somehow I was not able to find this information on the web. ', 3, '2020-07-24 19:06:39','2020-07-31 01:32:39'),
(3,'I am getting this error on selenium python','{ "ops" :[{"insert":"This error has no relates to my webscraping bot at all. my code does not cause this error. it is just there, and i would like to get rid of it. any ideas?\nBluetooth: bluetooth_adapter_winrt.cc:1074 Getting Default Adapter failed."},{"attributes":{"code-block":true},"insert":"\n"}] }',"This error has no relates to my webscraping bot at all.my code does not cause this error.it is just there,
and i would like to get rid of it.any ideas ? Bluetooth: bluetooth_adapter_winrt.cc :1074 Getting Default Adapter failed.",1,'2020-07-24 05:06:39','2020-07-25 19:06:39'),
(4,'How do I completely uninstall Node.js, and reinstall from beginning (Mac OS X)','{ "ops" :[{"insert":"My version of node is always v0.6.1-pre even after I install brew node and NVM install v0.6.19.\nMy node version is:\nnode -v"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"v0.6.1-pre"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"NVM says this (after I install a version of node for the first time in one bash terminal):\nnvm ls"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"v0.6.19"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"current:    v0.6.19"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"But when I restart bash, this is what I see:\nnvm ls"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"v0.6.19"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"current:    v0.6.1-pre"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"default -> 0.6.19 (-> v0.6.19)"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"So where is this phantom node 0.6.1-pre version and how can I get rid of it? I am trying to install libraries via NPM so that I can work on a project.\nI tried using BREW to update before NVM, using brew update and brew install node. I have tried deleting the \"node\" directory in my /usr/local/include and the \"node\" and \"node_modules\" in my /usr/local/lib. I have tried uninstalling npm and reinstalling it following "},{"attributes":{"color":"var(--blue-700)","link":"https://superuser.com/questions/268946/uninstall-node-js"},"insert":"these"},{"insert":" instructions.\n"}] }','My version of node is always My version of node is always v0.6.1-pre even after I install brew node and NVM install v0.6.19.
My node version is:
node -v
v0.6.1-pre
NVM says this (after I install a version of node for the first time in one bash terminal):
nvm ls
v0.6.19
current:    v0.6.19
But when I restart bash, this is what I see:
nvm ls
v0.6.19
current:    v0.6.1-pre
default -> 0.6.19 (-> v0.6.19)
So where is this phantom node 0.6.1-pre version and how can I get rid of it? I am trying to install libraries via NPM so that I can work on a project.
I tried using BREW to update before NVM, using brew update and brew install node. I have tried deleting the "node" directory in my /usr/local/include and the "node" and "node_modules" in my /usr/local/lib. I have tried uninstalling npm and reinstalling it following these instructions.v0.6.1-pre even after I install brew node and NVM install v0.6.19.\nMy node version is:\nnode -v\nv0.6.1-pre\nNVM says this (after I install a version of node for the first time in one bash terminal):\nnvm ls\nv0.6.19\ncurrent:    v0.6.19\nBut when I restart bash, this is what I see:\nnvm ls\nv0.6.19\ncurrent:    v0.6.1-pre\ndefault -> 0.6.19 (-> v0.6.19)\nSo where is this phantom node 0.6.1-pre version and how can I get rid of it? I am trying to install libraries via NPM so that I can work on a project.\nI tried using BREW to update before NVM, using brew update and brew install node. I have tried deleting the \"node\" directory in my /usr/local/include and the \"node\" and \"node_modules\" in my /usr/local/lib. I have tried uninstalling npm and reinstalling it following these instructions.',2,'2020-06-24 19:06:49','2020-07-19 19:06:49'),
(5,"Remove all child elements of a DOM node in JavaScript",'{ "ops" :[{"insert":"How would I go about removing all of the child elements of a DOM node in JavaScript?\nSay I have the following (ugly) HTML:\n<p id=\"foo\">"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    <span>hello</span>"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    <div>world</div>"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"</p>"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"And I grab the node I want like so:\nvar myNode = document.getElementById(\"foo\");"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"How could I remove the children of foo so that just <p id=\"foo\"></p> is left?\nCould I just do:\nmyNode.childNodes = new Array();"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"or should I be using some combination of removeElement?\nI had like the answer to be straight up DOM; though extra points if you also provide an answer in jQuery along with the DOM-only answer.\n"}] }','How would I
go about removing all of the child elements of a DOM node in JavaScript ? Say I have the following (ugly) HTML: < p id = "foo" > < span > hello < / span > < div > world < / div > < / p >
  And I grab the node I want like so: var myNode = document.getElementById("foo");
How could I remove the children of foo so that just < p id = "foo" > < / p > is left ? Could I just do: myNode.childNodes = new Array();
or should I be using some combination of removeElement ? I had like the answer to be straight up DOM; though extra points if you also provide an answer in jQuery along with the DOM-only answer.',3,'2020-07-28 12:01:10','2020-07-28 12:01:10'),
(6,"How to test multiple variables against a value ?",'{"ops":[{"insert":"I am trying to make a function that will compare multiple variables to an integer and output a string of three letters. I was wondering if there was a way to translate this into Python. So say:\nx = 0"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"y = 1"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"z = 3"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"mylist = []"},{"attributes":{"code-block":true},"insert":"\n\n"},{"insert":"if x or y or z == 0 :"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    mylist.append(\"c\")"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"if x or y or z == 1 :"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    mylist.append(\"d\")"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"if x or y or z == 2 :"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    mylist.append(\"e\")"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"if x or y or z == 3 : "},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    mylist.append(\"f\")"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"which would return a list of:\n[\"c\", \"d\", \"f\"]"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"Is something like this possible?\n"}]}','I am trying to make a function that will compare multiple variables to an integer and output a string of three letters. I was wondering if there was a way to translate this into Python. So say:
x = 0
y = 1
z = 3
mylist = []

if x or y or z == 0 :
    mylist.append("c")
if x or y or z == 1 :
    mylist.append("d")
if x or y or z == 2 :
    mylist.append("e")
if x or y or z == 3 : 
    mylist.append("f")
which would return a list of:
["c", "d", "f"]
Is something like this possible?',1,'2020-07-31 12:01:10','2020-08-01 10:01:10');


INSERT INTO answers (id, body, body_text, question, owner,created,last_modified, is_accepted)
  VALUES 
   (1,'{"ops":[{"insert":"Use PRAGMA foreign_keys option in sqlite3\nlike this:\nPRAGMA foreign_keys = ON"},{"attributes":{"code-block":true},"insert":"\n"},{"attributes":{"bold":true},"insert":"*This works for a session.. if the client gets disconnected or the session ends, you need to set it up again"},{"insert":"\n"}]}', 'Use PRAGMA foreign_keys option in sqlite3\nlike this:\nPRAGMA foreign_keys = ON\n*This works for a session.. if the client gets disconnected or the session ends, you need to set it up again\n',1,3,'2020-07-25 19:06:49','2020-07-25 19:06:49', 1),
   (2,'{"ops":[{"insert":"Sorry! "},{"attributes":{"color":"#e60000"},"insert":"There is no way to do that!!"},{"insert":"\n\n"},{"attributes":{"bold":true},"insert":"Sqlite3 "},{"insert":"does not support foreign key constraint\n"}]}', 'Sorry! There is no way to do that!!\n\nSqlite3 does not support foreign key constraint\n', 1, 2,'2020-07-28 19:06:49','2020-07-28 19:06:49', 0),
   (3,'{"ops":[{"insert":"\nTry disabling the logging when you initiate your driver:\nchrome_options = webdriver.ChromeOptions(); "},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"chrome_options.add_experimental_option(\"excludeSwitches\", [enable-logging`]);"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"driver = webdriver.Chrome(options=chrome_options);  "},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"I can not reproduce this to tell you if it will work however give it a go and let us know. ...Out of site, out of mind?\n"}]}',"\nTry disabling the logging when you initiate your driver:\nchrome_options = webdriver.ChromeOptions(); \nchrome_options.add_experimental_option('excludeSwitches', ['enable-logging']);\ndriver = webdriver.Chrome(options=chrome_options);  \nI can not reproduce this to tell you if it will work however give it a go and let us know. ...Out of site, out of mind?\n",3,10,'2020-07-26 19:06:49','2020-07-26 19:06:49',0),
   (4,'{ "ops" :[{"insert":"Apparently, there was a /Users/myusername/local folder that contained a include with node and lib with node and node_modules. How and why this was created instead of in my /usr/local folder, I do not know.\nDeleting these local references fixed the phantom v0.6.1-pre. If anyone has an explanation, I will choose that as the correct answer.\n"},{"attributes":{"bold":true},"insert":"EDIT:"},{"insert":"\nYou may need to do the additional instructions as well:\nsudo rm -rf /usr/local/{lib/node{,/.npm,_modules},bin,share/man}/{npm*,node*,man1/node*}"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"which is the equivalent of (same as above)...\nsudo rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* /usr/local/lib/dtrace/node.d ~/.npm ~/.node-gyp "},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"Additionally, NVM modifies the PATH variable in $HOME/.bashrc, which must be "},{"attributes":{"color":"var(--blue-700)","link":"https://github.com/creationix/nvm#removal"},"insert":"reverted manually"},{"insert":".\nThen download "},{"attributes":{"bold":true},"insert":"nvm"},{"insert":" and follow the instructions to install node. The latest versions of node come with "},{"attributes":{"bold":true},"insert":"npm"},{"insert":", I believe, but you can also reinstall that as well.\n"}] }','Apparently, there was a /Users/myusername/local folder that contained a include with node and lib with node and node_modules. How and why this was created instead of in my /usr/local folder, I do not know.\nDeleting these local references fixed the phantom v0.6.1-pre. If anyone has an explanation, I will choose that as the correct answer.\nEDIT:\nYou may need to do the additional instructions as well:\nsudo rm -rf /usr/local/{lib/node{,/.npm,_modules},bin,share/man}/{npm*,node*,man1/node*}\nwhich is the equivalent of (same as above)...\nsudo rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* /usr/local/lib/dtrace/node.d ~/.npm ~/.node-gyp \nAdditionally, NVM modifies the PATH variable in $HOME/.bashrc, which must be reverted manually.\nThen download nvm and follow the instructions to install node. The latest versions of node come with npm, I believe, but you can also reinstall that as well.\n',4, 1, '2020-07-14 19:06:49','2020-07-20 19:06:49',1),
   (5, '{ "ops" :[{"insert":"I have been hit by an issue during uninstall of Node.js on my mac. I had some strange behavior like npm is still their even after having removing it with all this.\nIt was because I had an old install done with macport. So you also have to uninstall it using port:\nsudo port uninstall nodejs"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"It may have install many different versions of Node.js so uninstall them all (one by one).\n"}] }','I have been hit by an issue during uninstall of Node.js on my mac. I had some strange behavior like npm is still their even after having removing it with all this.\nIt was because I had an old install done with macport. So you also have to uninstall it using port:\nsudo port uninstall nodejs\nIt may have install many different versions of Node.js so uninstall them all (one by one).\n',4, 3,'2020-07-24 19:06:49','2020-07-24 19:06:49',0),
   (6, '{ "ops" :[{"insert":"On Mavericks I install it from the node pkg (from nodejs site) and I uninstall it so I can re-install using brew. I only run 4 commands in the terminal:\nsudo rm -rf  /usr/local/lib/node_modules/npm/"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"brew uninstall node"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"brew doctor"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"brew cleanup --prune-prefix"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"If there is still a node installation, repeat step 2. After all is ok, I install using brew install node\n"}] }','On Mavericks I install it from the node pkg (from nodejs site) and I uninstall it so I can re-install using brew. I only run 4 commands in the terminal:\nsudo rm -rf  /usr/local/lib/node_modules/npm/\nbrew uninstall node\nbrew doctor\nbrew cleanup --prune-prefix\nIf there is still a node installation, repeat step 2. After all is ok, I install using brew install node\n',4,10,'2020-07-14 19:06:49','2020-07-30 19:06:49',0),
   (7, '{ "ops" :[{"insert":"I know this post is a little dated but just wanted to share the commands that worked for me in Terminal when removing Node.js.\nlsbom -f -l -s -pf /var/db/receipts/org.nodejs.pkg.bom | while read f; do  sudo rm /usr/local/${f}; done"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":" "},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"sudo rm -rf /usr/local/lib/node /usr/local/lib/node_modules /var/db/receipts/org.node"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"\n"}] }','I know this post is a little dated but just wanted to share the commands that worked for me in Terminal when removing Node.js.\nlsbom -f -l -s -pf /var/db/receipts/org.nodejs.pkg.bom | while read f; do  sudo rm /usr/local/${f}; done\n \nsudo rm -rf /usr/local/lib/node /usr/local/lib/node_modules /var/db/receipts/org.node\n\n',4,9,'2020-07-24 19:06:49','2020-07-24 19:06:49',0),
   (8, '{ "ops" :[{"insert":"This approach is simple, but might not be suitable for high-performance applications because it invokes the browser has HTML parser (though browsers "},{"attributes":{"italic":true},"insert":"may"},{"insert":" optimize for the case where the value is an empty string).\ndoFoo.onclick = () => {"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  const myNode = document.getElementById(\"foo\");"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  myNode.innerHTML = '';"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"}"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"<div id=`foo` style=\"height: 100px; width: 100px; border: 1px solid black;\">"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  <span>Hello</span>"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"</div>"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"<button id=`doFoo`>Remove via innerHTML</button>"},{"attributes":{"code-block":true},"insert":"\n"}] }','This approach is simple,
but might not be suitable for high - performance applications because it invokes the browser has HTML parser (though browsers may optimize for the case where the value is an empty string).
doFoo.onclick = () => {
  const myNode = document.getElementById("foo");
  myNode.innerHTML = '';
}
<div id=`foo` style="height: 100px; width: 100px; border: 1px solid black;">
  <span>Hello</span>
</div>
<button id=`doFoo`>Remove via innerHTML</button>',5,6,'2020-07-30 12:01:10','2020-07-31 12:01:10',1),
   (9,'{ "ops" :[{"insert":"var myNode = document.getElementById(\"foo\");"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"var fc = myNode.firstChild;"},{"attributes":{"code-block":true},"insert":"\n\n"},{"insert":"while( fc ) {"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    myNode.removeChild( fc );"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    fc = myNode.firstChild;"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"}"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"If there is any chance that you have jQuery affected descendants, then you "},{"attributes":{"italic":true},"insert":"must"},{"insert":" use some method that will clean up jQuery data.\n$(`#foo`).empty();"},{"attributes":{"code-block":true},"insert":"\n"},{"attributes":{"color":"var(--blue-700)","link":"http://api.jquery.com/empty/"},"insert":"The jQuery .empty() method"},{"insert":" will ensure that any data that jQuery associated with elements being removed will be cleaned up.\nIf you simply use DOM methods of removing the children, that data will remain.\n"}] }','var myNode = document.getElementById("foo");
var fc = myNode.firstChild;
while(fc) { myNode.removeChild(fc);
fc = myNode.firstChild;
} If there is any chance that you have jQuery affected descendants, then you must use some method that will clean up jQuery data.
$(`#foo`).empty();
The jQuery.empty() method will ensure that any data that jQuery associated with elements being removed will be cleaned up.If you simply use DOM methods of removing the children,
that data will remain.',5,9,'2020-07-28 19:01:10','2020-07-30 12:01:10',0),
   (10,'{ "ops" :[{"insert":"The direct way to write x or y or z == 0 is\nif any(map((lambda value: value == 0), (x,y,z))):"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    pass # write your logic."},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"But I dont think, you like it. :) And this way is ugly.\nThe other way (a better) is:\n0 in (x, y, z)"},{"attributes":{"code-block":true},"insert":"\n"}] }','The direct way to write x
or y
or z == 0 is if any(map((lambda value: value == 0), (x, y, z))): pass # write your logic.
But I dont think,
you like it.:
)
And this way is ugly.The other way (a better) is: 0 in (x, y, z)',6,7,'2020-08-01 11:01:10','2020-08-01 11:01:10',0),
   (11,'{"ops":[{"insert":"I am trying to make a function that will compare multiple variables to an integer and output a string of three letters. I was wondering if there was a way to translate this into Python. So say:\nx = 0"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"y = 1"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"z = 3"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"mylist = []"},{"attributes":{"code-block":true},"insert":"\n\n"},{"insert":"if x or y or z == 0 :"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    mylist.append(\"c\")"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"if x or y or z == 1 :"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    mylist.append(\"d\")"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"if x or y or z == 2 :"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    mylist.append(\"e\")"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"if x or y or z == 3 : "},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    mylist.append(\"f\")"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"which would return a list of:\n[\"c\", \"d\", \"f\"]"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"Is something like this possible?\n\n"}]}','Your problem is more easily addressed with a dictionary structure like: x = 0 y = 1 z = 3 d = { 0: `c`,
1 :`d`,
2 :`e`,
3 :`f` } mylist = [d[k] for k in [x, y, z]]',6,10,'2020-07-31 19:01:10','2020-07-31 19:01:10',0);


INSERT INTO question_comments (id, body, owner,question)
  VALUES 
   (1,'nice question', 3, 1),
   (2,'I am also facing same problem', 3, 1),
   (3,'Please provide some code snippet', 2, 1),
   (4,"I can 't get extra info from your question. But I find the same error message question, hope can help you.",5,3),
   (5,"this might help for whoever installed node via pkg file.",10,4),
   (6,"Even after following instruction in gist, still node and npm exists on Mac OS 10.13.5",2,4),
   (7,"Take extra care when comparing to 'falsey' values like 0, 0.0 or False. You can easily write wrong code which gives the 'right' answer.",8,6);
   


INSERT INTO answer_comments (id, body, owner, answer)
  VALUES 
   (1,'Thanks for the answer!', 1, 1),
   (2,'Welcome', 3, 1),
   (3,"I tried it but again getting same error Error: The brew link step did not complete successfully", 8, 6),
   (4,"I also had to add: sudo rm -rf ~/.node-gyp. I had added it with MacPorts before I switched to brew.", 9, 5),
   (5,"I tried it but again getting same error Error: The brew link step did not complete successfully", 10, 6),
   (6,"Btw using lastChild seem to be a bit more effective",10,7),
   (7,"innerHTML only works if you are only dealing with HTML.If there is e.g.SVG inside only Element removal will work",10,5),
   (8,'or map(lambda i: `cdef` [i], [x, y, z])',1,10),
   (9,'This does not answer the OP question.It only covers the first case in the provided example',9,11);



INSERT INTO tags (id,tag_name)
  VALUES 
   (1,"sqlite3"),
   (2,"foreign_key"),
   (3,"node"),
   (4,"asynchronous"),
   (5,"python"),
   (6,"selenium"),
   (7,"javascript"),
   (8,"node.js"),
   (9,"npm"),
   (10, "Dom"),
   (11, "match");

INSERT INTO questions_tags (tag_id,question_id)
  VALUES 
   (1, 1),
   (2, 1),
   (3, 2),
   (4, 2),
   (5, 3),
   (6, 3),
   (7, 4),
   (8, 4),
   (9, 4),
   (10, 5),
   (7, 5),
   (5, 6),
   (11, 6);




INSERT INTO question_votes (question_id,user,vote_type)
  VALUES 
   (1, 2, 1),
   (1, 3, 1),
   (2, 2, 0),
   (3, 1, 1),
   (3, 2, 1),
   (3, 5, 1),
   (4, 1, 1),
   (4, 2, 1),
   (4, 3, 1),
   (4, 4, 1),
   (4, 5, 1),
   (4, 6, 1),
   (4, 7, 1),
   (4, 10, 1),
   (5, 1, 1),
   (5, 2, 1),
   (5, 3, 1),
   (5, 4, 1),
   (5, 5, 1),
   (5, 6, 1),
   (5, 7, 1),
   (5, 8, 1),
   (6, 7, 1),
   (6, 8, 1),
   (6, 9, 1);



INSERT INTO answer_votes (answer_id,user,vote_type)
  VALUES 
   (1, 1, 1),
   (1, 2, 1),
   (2, 1, 0),
   (3, 1, 0),
   (4, 1, 1),
   (4, 2, 1),
   (4, 3, 1),
   (4, 4, 1),
   (4, 5, 1),
   (4, 6, 1),
   (5, 1, 1),
   (5, 2, 1),
   (5, 3, 1),
   (6, 1, 1),
   (6, 2, 1),
   (7, 1, 1),
   (7, 2, 1),
   (7, 3, 1),
   (8, 1, 1),
   (8, 2, 1),
   (8, 3, 1),
   (8, 4, 1),
   (8, 5, 1),
   (8, 6, 1),
   (8, 7, 1),
   (8, 8, 1),
   (8, 9, 1),
   (8, 10, 1),
   (9, 1, 1),
   (9, 2, 1),
   (9, 3, 1),
   (9, 4, 1),
   (9, 5, 1),
   (10, 1, 1),
   (10, 2, 1),
   (10, 3, 1),
   (10, 4, 1),
   (10, 5, 1),
   (11, 4, 1),
   (11, 1, 1);



