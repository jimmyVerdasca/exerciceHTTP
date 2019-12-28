const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv/config');
const {dblink, dbname} = require('./config');

/**
 * factorizing method that connects to mongoDB 
 * @param {function} callback function that takes the mongodb client as parameter
 */
function mongoCall(callback) {
        MongoClient.connect(dblink, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
            callback(client);
        });
}


module.exports = {
    /**
     * generic callback to provide access to mongoDB client
     * @param {function} cb that will be called with mongoClient as parameter
     */
    mongoCallback: function(cb) {
        mongoCall((client) => {
            cb(client.db(dbname));
            client.close();
        });
    },
    /**
     * try to create an object in mongoDB and callback the response
     * @param {string} collection in which the object should be stored
     * @param {object} object we want to create
     * @param {function} cb function called with the response as parameter
     */
    create: function(collection, object, cb) {
        mongoCall((client) => {
            client.db(dbname).collection(collection).insertOne(object, function(err, response) {
                //console.log(response);
                cb(response);
            });
            client.close();
        });
    },
    /**
     * read a full collection and callback with the response as parameter
     * @param {string} collection that we read
     * @param {function} cb function called with the response as parameter
     */
    getAll: function(collection, cb) {
        mongoCall((client) => {
            client.db(dbname).collection(collection).find({}).toArray(function(err, response) {
                cb(response);
                client.close();
            });
        });
    },
    /**
     * read an object from a collection with a given id and callback with the response as parameter
     * @param {string} collection where we read in
     * @param {*} id we are looking for
     * @param {function} cb function called with the response as parameter
     */
    getOne: function(collection, id, cb) {
        mongoCall((client) => {
            // if id length is 24 it's maybe an automatic id from mongoDB
            const query = id.length === 24 ? {$or: [{_id: id}, {_id: new ObjectId(id)}]} : {_id: id};
            client.db(dbname).collection(collection).findOne(query, function(err, response) {
                cb(response);
                client.close();
            });
        });
    },
    /**
     * update an object from a collection with a given id and callback with the response as parameter
     * @param {string} collection where we read in
     * @param {*} id of the object we wish to modify
     * @param {object} updatedObject the object with the new values
     * @param {function} cb function called with the response as parameter
     */
    updateOne: function(collection, id, updatedObject, cb) {
        mongoCall((client) => {
            // if id length is 24 it's maybe an automatic id from mongoDB
            const query = id.length === 24 ? {$or: [{_id: id, deleted: null}, {_id: new ObjectId(id)}]} : {_id: id, deleted: null};
            let date = new Date();
            updatedObject.modified = date;
            client.db(dbname).collection(collection).updateOne(query, {$set: updatedObject}, {}, function(err, response) {
                cb(response);
                client.close();
            });
        });
    },
    /**
     * delete an object by adding him a deleted timestamp field and setting to null his data field
     * @param {string} collection where we read in
     * @param {*} id of the object we wish to delete
     * @param {function} cb function called with the response as parameter
     */
    deleteOne: function(collection, id, cb) {
        mongoCall((client) => {
            // if id length is 24 it's maybe an automatic id from mongoDB
            const query = id.length === 24 ? {$or: [{_id: id, deleted: null}, {_id: new ObjectId(id)}]} : {_id: id, deleted: null};
            client.db(dbname).collection(collection).findOne(query, function(err, itemFound) {
                itemFound.data = null;
                let date = new Date();
                itemFound.deleted = date;
                client.db(dbname).collection(collection).updateOne(query, {$set: itemFound}, {}, function(err2, response) {
                    cb(response);
                    client.close();
                });
            });
        });
    },
    /**
     * read a user in DB
     * @param {object} user object with username and password fields that we are looking for
     * @param {function} cb  function called with the user as parameter
     */
    getUser: function(user, cb) {
        mongoCall((client) => {
            client.db(dbname).collection('users').findOne(user, function(err, response) {
                cb(response);
                client.close();
            });
        });
    },
    /**
     * delete an object in DB (method used by functionnal test to avoid fill the DB with garbage)
     * @param {string} collection where we delete the item
     * @param {*} id of the item we wish to delete
     * @param {function} cb function called once we finished to delete the item
     */
    cleanOne: function(collection, id, cb) {
        mongoCall(async (client) => {
            await client.db(dbname).collection(collection).deleteOne({_id: id}, function(err, response) {
                client.close();
                cb();
            });
        });
    }
}
