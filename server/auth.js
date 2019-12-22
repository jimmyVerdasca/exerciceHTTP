const express = require('express');
const jwt = require('jsonwebtoken');
const {jwtOptions} = require('./config');
const passport = require('passport');
const passportLocal = require('passport-local');
const passportJWT = require('passport-jwt');

const USER = {
    id: '1234',
    username:'admin',
    password: 'admin'
}

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
       //TODO database call    
        if (username == USER.username && password === USER.password) {
            done(null, USER);
        } else {
            done(null, false);
        }
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
        //TODO database call    
        if (userId !== USER.id) {
            done(null, false);
        } else {
            done(null, USER);
        }
    }
));


router.post('/login', passport.authenticate('localStrategy', {session: false}), (req, res) => {
    const {password, ...user} = req.user;
    const token = jwt.sign({userId: user.id}, jwtOptions.secret);
    res.send({user, token});
});

module.exports = router;