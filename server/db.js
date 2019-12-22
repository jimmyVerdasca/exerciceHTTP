const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = "mongodb+srv://admin:admin@cluster0-o7gqy.mongodb.net/test?retryWrites=true&w=majority";
const dbName = 'db';


module.exports = function(cb) {
  MongoClient.connect(url, {useNewUrlParser: true,  useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        cb(client.db(dbName));
        client.close();
  });
}
