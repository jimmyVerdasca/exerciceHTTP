
# Simple HTTP server
This project is a simple HTTP server. Routes are :

POST /users
POST /auth/login
POST /datas
GET /datas
GET /datas/:dataId
UPDATE /datas/:dataId
DELTE /datas/:dataId

# requirement

In a empty folder:
`git clone git@github.com:jimmyVerdasca/exerciceHTTP.git`
`cd server`
`npm install express mongodb passport date-and-time dotenv jsonwebtoken passeport-jwt passport-local`
`npm install --save-dev mocha nodemon`

express easy to use HTTP library used to write the API
mongodb used to have a cloud database where is stored users and datas
passport is the authentication middleware, in this project two strategies are used:
* passport-local (username,password)->USER
* passport-jwt (JWTtoken)->USER

date-and-time allows to give timestamps at Creation of items in database
dotenv is the module to load environnement variables stored in .env file in this project
jsonwebtoken allows to use sign and verify methods to create and check the JWTtoken

# How to run
## `npm run`
will call `node index.js`
## `npm run dev`
will call `nodemon index.js`, nodemon will automatically restart the server each time you modify and save a file
## `npm test`
will call mocha and run test in the folder test
