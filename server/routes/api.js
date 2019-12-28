const express = require('express');
const passport = require('passport');
const getUser = require("../db").getUser;
const create = require("../db").create;
const getAll = require("../db").getAll;
const getOne = require("../db").getOne;
const updateOne = require("../db").updateOne;
const deleteOne = require("../db").deleteOne;
const dbToObject = require("../util").dbToObject;
const checkDataCreationFields = require("../util").checkDataCreationFields;
const cuid = require('cuid');
require('mongodb');

const router = express.Router();
const authenticate = () => passport.authenticate('jwtStrategy', {session: false});

/**
 * give to callback true or false if the given user exist yet in DB
 * @param {object} user the user we are checking
 * @param {function} cb function to call with resulting check value
 */
function isUserExistYet(user, cb) {
    getUser(user, (response) => {
        if (response === null) {
            cb(false);
        } else {
            cb(true);
        }
    });
}

/**
 * simple response to a POST http request
 * -status 500 if the creation failed
 * -status 201 if the creation success
 * 
 * @param {*} response coming from the DB after trying to POST
 * @param {*} res object to send back the result to the caller
 */
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

/**
 * simple response to a PUT or DELETE http request
 * -status 404 if we don't modify
 * -status 204 if the modification success
 * 
 * @param {*} req request object
 * @param {*} response coming from the DB after trying to PUT or DELETE
 * @param {*} res object to send back the result to the caller
 */
function respondToPUTOrDELETE(req, res, response) {
    if(response.modifiedCount === 0) {
        res.status(404);
        res.send("data " + req.params.dataId + " not found or deleted");
    } else {
        res.status(204).send();
    }
}

// GET /users allows to create user accounts by providing a JSON payload containinig the fields username and password. (public route)
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

// POST /datas allows to add new data to the data collection in DB.
// Fields accepted for a data are : id(optional), data.
// data contains at most 10 Fields of type integers or strings of max length 512 
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

// Read all datas in the DB
router.get('/datas', authenticate(), (req, res) => {
    getAll('datas', (response) => {
        for (let index = 0; index < response.length; index++) {
            response[index] = dbToObject(response[index]);
            
        }
        res.send(dbToObject(response));
    });
});

// Read one data in the DB with given id
router.get('/datas/:dataId', authenticate(), (req, res) => {
    getOne('datas', req.params.dataId, (response) => {
        res.send(dbToObject(response));
    });
});

// Update one data in DB. Can not modify a deleted data.
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

// Delete one delete the data field of the given data id and add a deleted timestamp
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