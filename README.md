
# Simple HTTP server
This project is a simple HTTP server. Routes are :

METHOD | PATH           | BODY               | HEADERS       | RETURN
-------|----------------|--------------------|---------------|--------
POST   | /users         | username, password |               | username, passord, id
POST   | /auth/login    | username, password | Authorization | user{id, username}, token
POST   | /datas         | [id], data         | Authorization | id, data, created, modified
GET    | /datas         |                    | Authorization | array of (id, data, created, modified)
GET    | /datas/:dataId |                    | Authorization | id, data, created, modified
UPDATE | /datas/:dataId | data               | Authorization | status 200 or 404
DELTEE | /datas/:dataId |                    | Authorization | status 200 or 404

remarks All body not empty method necessite a header Content-Type to application/json. [] s an optionnal body field.

# Requirements

In a empty folder:

`git clone git@github.com:jimmyVerdasca/exerciceHTTP.git`

`cd exerciceHTTP/server/`

`npm install express mongodb passport date-and-time dotenv jsonwebtoken passport-jwt passport-local cuid`

`npm install --save-dev mocha nodemon`

Then add a .env file in the folder server with this content :

PORT=4000
JWT_SECRET=r_9vi5ezinGXlv
URL=http://localhost
DBNAME=dbName
DBLINK=mongodbgivenlink

express easy to use HTTP library used to write the API

mongodb used to have a cloud database where is stored users and datas

passport is the authentication middleware, in this project two strategies are used:
* passport-local (username,password)->USER
* passport-jwt (JWTtoken)->USER

date-and-time allows to give timestamps at Creation of items in database

dotenv is the module to load environnement variables stored in .env file in this project

jsonwebtoken allows to use sign and verify methods to create and check the JWTtoken

cuid is used to create collision safe ids.

# How to run
## `npm run start`
will call `node index.js`
## `npm run dev`
will call `nodemon index.js`, nodemon will automatically restart the server each time you modify and save a file
## `npm test`
will call mocha and run test in the folder test (first launch the server in an other command line tool)
