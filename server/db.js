const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;

const url = "mongodb+srv://admin:admin@cluster0-o7gqy.mongodb.net/test?retryWrites=true&w=majority";
const dbName = 'db';


module.exports = {
    mongoCallback: function(cb) {
        MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
                cb(client.db(dbName));
                client.close();
        });
    },
    create: function(collection, object, cb) {
        MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
            client.db(dbName).collection(collection).insertOne(object, function(err, response) {
                //console.log(response);
                cb(response);
            });
            client.close();
        });
    },
    getAll: function(collection, cb) {
        MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
            client.db(dbName).collection(collection).find({}).toArray(function(err, response) {
                cb(response);
                client.close();
            });
        });
    },
    getOne: function(collection, id, cb) {
        MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
            // if id length is 24 it's maybe an automatic id from mongoDB
            const query = id.length === 24 ? {$or: [{_id: id}, {_id: new ObjectId(id)}]} : {_id: id};
            client.db(dbName).collection(collection).findOne(query, function(err, response) {
                cb(response);
                client.close();
            });
        });
    },
    updateOne: function(collection, id, updatedObject, cb) {
        MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
            // if id length is 24 it's maybe an automatic id from mongoDB
            const query = id.length === 24 ? {$or: [{_id: id, deleted: null}, {_id: new ObjectId(id)}]} : {_id: id, deleted: null};
            let date = new Date();
            updatedObject.modified = date;
            client.db(dbName).collection(collection).updateOne(query, {$set: updatedObject}, {}, function(err, response) {
                cb(response);
                client.close();
            });
        });
    },
    deleteOne: function(collection, id, cb) {
        MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
            // if id length is 24 it's maybe an automatic id from mongoDB
            const query = id.length === 24 ? {$or: [{_id: id, deleted: null}, {_id: new ObjectId(id)}]} : {_id: id, deleted: null};
            client.db(dbName).collection(collection).findOne(query, function(err, itemFound) {
                itemFound.data = null;
                let date = new Date();
                itemFound.deleted = date;
                client.db(dbName).collection(collection).updateOne(query, {$set: itemFound}, {}, function(err2, response) {
                    cb(response);
                    client.close();
                });
            });
        });
    },
    getUser: function(user, cb) {
        MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
            client.db(dbName).collection('users').findOne(user, function(err, response) {
                cb(response);
                client.close();
            });
        });
    }
}
