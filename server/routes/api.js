const express = require('express');
const passport = require('passport');

const router = express.Router();
const authenticate = () => passport.authenticate('jwtStrategy', {session: false});

router.get('/welcome', (req, res) => {
    res.send({ message: 'plop'});
});

router.get('/plop', authenticate(), (req, res) => {
    res.send({plop: null});
});

module.exports = router;