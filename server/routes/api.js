const express = require('express');
const passport = require('passport');
const mongo = require("../db");
require('mongodb');

const router = express.Router();
const authenticate = () => passport.authenticate('jwtStrategy', {session: false});

//A single HTTP route /users that allows to create user accounts by providing a JSON payload containinig the fields username and password.
router.post('/users', (req, res) => {
    const user = {username: req.body.username, password: req.body.password};
    mongo((db) => {
        db.collection('users').insertOne(user, function(err, response) {
            if (response === null || response.ops[0] === null) {
                res.write("impossible to create");
                res.status(500).end();
            } else {
                res.write(JSON.stringify(response.ops[0]));
                res.status(201).end();
            }
        });
    });
});

router.post('/datas', authenticate(), (req, res) => {
    res.send({plop: null});
});

// Retrieve all Notes
router.get('/datas', authenticate(), (req, res) => {
    res.send({plop: null});
});

// Retrieve a single Note with noteId
router.get('/datas/:dataId', authenticate(), (req, res) => {
    res.send({plop: null});
});

// Update a Note with noteId
router.put('/datas/:dataId', authenticate(), (req, res) => {
    res.send({plop: null});
});

// Delete a Note with noteId
router.delete('/datas/:dataId', authenticate(), (req, res) => {
    res.send({plop: null});
});

module.exports = router;