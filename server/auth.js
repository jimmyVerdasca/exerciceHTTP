const express = require('express');
const jwt = require('jsonwebtoken');
const {jwtOptions} = require('./config');
const passport = require('passport');
const passportLocal = require('passport-local');
const passportJWT = require('passport-jwt');
const mongo = require("./db");
const ObjectId = require('mongodb').ObjectID;

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
        mongo((db) => {
            db.collection("users").findOne({username: username, password: password}, function(err, USER) {
                if (USER !== null && username === USER.username && password === USER.password) {
                    done(null, {id: USER._id, username: USER.username, password: password});
                } else {
                    done(null, false);
                }
            });
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
        
        mongo((db) => {
             db.collection("users").findOne({_id: ObjectId(userId)}, function(err, USER) {
                 if (USER === null || userId !== USER._id.toString()) {
                    done(null, false);
                } else {
                    done(null, USER);
                }
             });
        });
    }
));


router.post('/login', passport.authenticate('localStrategy', {session: false}), (req, res) => {
    const {password, ...user} = req.user;
    const token = jwt.sign({userId: user.id}, jwtOptions.secret, { expiresIn: '48h'});
    res.send({user, token});
});

module.exports = router;