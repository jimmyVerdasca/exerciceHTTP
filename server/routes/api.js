const express = require('express');
const passport = require('passport');
const getUser = require("../db").getUser;
const create = require("../db").create;
const getAll = require("../db").getAll;
const getOne = require("../db").getOne;
const updateOne = require("../db").updateOne;
const deleteOne = require("../db").deleteOne;
const cuid = require('cuid');
require('mongodb');

const router = express.Router();
const authenticate = () => passport.authenticate('jwtStrategy', {session: false});

function checkDataCreationFields(data) {
    if (typeof data === 'object') {
        if(data.length > 10) {
            return false;
        }
        let countFields = 0;
        for (var prop in data) {
            if (Object.prototype.hasOwnProperty.call(data, prop)) {
                countFields++;
                if (countFields > 10) {
                    return false;
                }
                if (typeof data[prop] !== 'number'
                && (typeof data[prop] !== 'string' || data[prop].length > 512)) {
                    return false;
                }
            }
        }
        return true;
    } else {
        return false;
    }
}

function isUserExistYet(user, cb) {
    getUser(user, (response) => {
        if (response === null) {
            cb(false);
        } else {
            cb(true);
        }
    });
}

function dbToObject(object) {
    object['id'] = object._id;
    delete object._id;
    return object
}

function respondToCreate(response, res) {
    if (response === null || response.ops[0] === null) {
        res.write("impossible to create");
        res.status(500);
        res.send();
    } else {
        res.status(201);
        res.send(JSON.stringify(dbToObject(response.ops[0])));
    }
}

function respondToPUTOrDELETE(req, res, response) {
    if(response.modifiedCount === 0) {
        res.status(404);
        res.send("data " + req.params.dataId + " not found or deleted");
    } else {
        res.status(204).send();
    }
}


//A single HTTP route /users that allows to create user accounts by providing a JSON payload containinig the fields username and password.
router.post('/users', (req, res) => {
    let user = {username: req.body.username, password: req.body.password};
    isUserExistYet(user, (exist) => {
        if(!exist) {
            user._id = cuid();
            create('users', user, (response) => {
                respondToCreate(response, res);
            });
        } else {
            res.status(400).send('user already exist, maybe you should login');
        }
    });
});

// Create
router.post('/datas', authenticate(), (req, res) => {
    const content = req.body.data;
    if (!checkDataCreationFields(content)) {
        res.status(400).send("data field should be an object that contains at most 10 fields of type integers or strings of max length 512");
        return;
    }
    const id = String(req.body.id);
    let date = new Date();
    date = date.toUTCString();
    let data;
    if (id !== "undefined") {
        data  = {_id: id, data: content, created: date, modified: date}
    } else {
        data  = {_id: cuid(), data: content, created: date, modified: date}
    }
    create('datas', data, (response) => {
        respondToCreate(response, res);
    });
});

// Read all
router.get('/datas', authenticate(), (req, res) => {
    getAll('datas', (response) => {
        for (let index = 0; index < response.length; index++) {
            response[index] = dbToObject(response[index]);
            
        }
        res.send(dbToObject(response));
    });
});

// Read one
router.get('/datas/:dataId', authenticate(), (req, res) => {
    getOne('datas', req.params.dataId, (response) => {
        res.send(dbToObject(response));
    });
});

// Update one
router.put('/datas/:dataId', authenticate(), (req, res) => {
    let {created, ...newData} = req.body;
    try {
        updateOne('datas', req.params.dataId, newData, (response) => {
            respondToPUTOrDELETE(req, res, response);
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
            respondToPUTOrDELETE(req, res, response);
        });
    } catch(err) {
        res.status(500);
        res.send(err);
    }
});

module.exports = router;