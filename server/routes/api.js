const express = require('express');
const passport = require('passport');
const ObjectId = require('mongodb').ObjectID;
const mongoCallback = require("../db").mongoCallback;
const create = require("../db").create;
const getAll = require("../db").getAll;
const getOne = require("../db").getOne;
const updateOne = require("../db").updateOne;
const deleteOne = require("../db").deleteOne;
const date = require('date-and-time');
require('mongodb');

const router = express.Router();
const authenticate = () => passport.authenticate('jwtStrategy', {session: false});

function respondToCreate(response, res) {
    if (response === null || response.ops[0] === null) {
        res.write("impossible to create");
        res.status(500);
        res.send();
    } else {
        res.status(201);
        res.send(JSON.stringify(response.ops[0]));
    }
}

function handlePutORDELETEResponse(req, res, response) {
    if(response.modifiedCount === 0) {
        res.status(404);
        res.send("data " + req.params.dataId + " not found");
    } else {
        res.status(204).send();
    }
}


//A single HTTP route /users that allows to create user accounts by providing a JSON payload containinig the fields username and password.
router.post('/users', (req, res) => {
    const user = {username: req.body.username, password: req.body.password};
    create('users', user, (response) => {
        respondToCreate(response, res);
    });
});

// Create
router.post('/datas', authenticate(), (req, res) => {
    const id = String(req.body.id);
    const content = req.body.data;
    let date = new Date();
    date = date.toUTCString();
    let data;
    if (id !== "undefined") {
        data  = {_id: id, data: content, created: date, modified: date}
    } else {
        data  = {data: content, created: date, modified: date}
    }
    create('datas', data, (response) => {
        respondToCreate(response, res);
    });
});

// Read all
router.get('/datas', authenticate(), (req, res) => {
    getAll('datas', (response) => {
        res.send(response);
    });
});

// Read one
router.get('/datas/:dataId', authenticate(), (req, res) => {
    getOne('datas', req.params.dataId, (response) => {
        res.send(response);
    });
});

// Update one
router.put('/datas/:dataId', authenticate(), (req, res) => {
    let {created, ...newData} = req.body;
    try {
        updateOne('datas', req.params.dataId, newData, (response) => {
            handlePutORDELETEResponse(req, res, response);
        });
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

// Delete one
router.delete('/datas/:dataId', authenticate(), (req, res) => {
    try {
        deleteOne('datas', req.params.dataId, (response) => {
            handlePutORDELETEResponse(req, res, response);
        });
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

module.exports = router;