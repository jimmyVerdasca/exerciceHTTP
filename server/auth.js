const express = require('express');
const jwt = require('jsonwebtoken');
const {jwtOptions} = require('./config');
const passport = require('passport');
const passportLocal = require('passport-local');
const passportJWT = require('passport-jwt');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const uriDB = "mongodb+srv://admin:admin@cluster0-o7gqy.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uriDB, { useNewUrlParser: true ,  useUnifiedTopology: true });

const router = express.Router();
const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const extractJWT = passportJWT.ExtractJwt;

// strategy if username and password are given
passport.use('localStrategy', new LocalStrategy(
   {
        usernameField: 'username',
        passwordField: 'password'
   },
   (username, password, done) => {
       client.connect((err) => {
           if(err) {
               done("impossible to connect to DB", false);
           }
            client.db("db").collection("users").findOne({username: username, password: password}, function(err, USER) {
                if (username === USER.username && password === USER.password && USER !== null) {
                    done(null, {id: USER._id, username: USER.username, password: password});
                } else {
                    done(null, false);
                }
            });
            client.close();
        });  
   }
));

// strategy if user and token are given
passport.use('jwtStrategy', new JWTStrategy(
    {
        secretOrKey: jwtOptions.secret,
        jwtFromRequest: extractJWT.fromAuthHeaderWithScheme('jwt')
    },
    (jwtPayload, done) => {
        const {userId} = jwtPayload;
        client.connect((err) => {
            if(err) {
                done("impossible to connect to DB", false);
            }
             client.db("db").collection("users").findOne({_id: ObjectId(userId)}, function(err, USER) {
                 if (USER === null || userId !== USER._id.toString()) {
                    done(null, false);
                } else {
                    done(null, USER);
                }
             });
             client.close();
         });
    }
));


router.post('/login', passport.authenticate('localStrategy', {session: false}), (req, res) => {
    const {password, ...user} = req.user;
    const token = jwt.sign({userId: user.id}, jwtOptions.secret, { expiresIn: '48h'});
    res.send({user, token});
});

module.exports = router;