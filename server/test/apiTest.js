const assert = require('assert');
const axios = require('axios')
require('dotenv/config');
const {port, jwtOptions, url} = require('../config');
const jwt = require('jsonwebtoken');
const cleanOne = require("../db").cleanOne;

const urlHttp = `${url}:${port}`;
const username = "adminTest";
const password = "adminTest";

/**
 * Http POST request to our server to create a data
 * @param {object} data content of the data field
 * @param {string} token to put in the authorization header
 */
async function createData(data, token) {
  return await axios.post(urlHttp + '/datas', {data: data}, {headers: { Authorization: `jwt ${token}`}})
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.error(error)
      assert.fail();
    });
}

/**
 * Http GET request to read a data with the given id
 * @param {*} id of the data object we are looking for
 * @param {string} token to put in the authorization header
 */
async function getData(id, token) {
  return await axios.get(urlHttp + '/datas/' + id,{ headers: { Authorization: `jwt ${token}` }})
    .then(async (res) => {
      return res;
    })
    .catch((error) => {
      console.error(error)
      assert.fail();
    });
}

/**
 * try to create a user with a POST Http request and callback with the response as parameter
 * @param {function} cb callback called with the response as parameter
 */
async function createUser(cb) {
    return await axios.post(urlHttp + '/users', {username: username, password: password})
    .then((res) => {
      cb(res.data);
    })
    .catch((error) => {
      console.error(error)
      assert.fail();
      done();
    });
}

/**
 * send an Http POST to /auth/login with given user to get the authorization token
 * @param {object} user object with username and password  string fields
 */
async function logIn(user) {
  return await axios.post(urlHttp + '/auth/login', {username: user.username, password: user.password})
      .then((response) => {
        const token = response.data.token;
        assert.notEqual('Unauthorized', response.data);
        return token;
      })
      .catch((err) => {
        console.log(err);
        assert.fail();
      });
}

describe('API test', function() {
  this.timeout(0);
  let user = null;
  const textData = "dataTest";
  const data = {fieldTest: textData};
  let token = null;
  let dataCreated = null;

  beforeEach(function(done) {
    // create a user and a data for each test
    createUser(async (response) => {
      user = response;
      token = await logIn(user);
      dataCreated = await createData(data, token);
      done();
    });
  });

  afterEach(function(done) {
    // clean the user and data created for the current test
    cleanOne('datas', dataCreated.data.id, () => {
      dataCreated = null;
      cleanOne('users', user.id, () => {
        user = null;
        done();
      })
    });
  });

  it('/users can create a new user', async function() {
    // check if the user has been created with the field necessary
    assert.strictEqual(username, user.username);
    assert.strictEqual(password, user.password);
    assert.notEqual(null, user.id);
    assert.notEqual(undefined, user.id);
  });
  
  it('/auth/login return a valid JWT token', async function() {
    const token = await logIn(user);
    var decoded = jwt.verify(token, jwtOptions.secret);

    // check if the jwt token once decoded possess all the fields necessary
    assert.notEqual(undefined, decoded.userId);
    assert.notEqual(undefined, decoded.iat);
    assert.notEqual(undefined, decoded.exp);
  });

  it('GET /datas without token returns 401 Unauthorized', async function() {
    const response = await axios.get(urlHttp + '/datas')
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
    
    // check if we received the 401 Unauthorized response
    assert.strictEqual("Unauthorized", response.response.statusText);
    assert.strictEqual(401, response.response.status);
  });

  it('GET /datas/:dataId return the data with given dataId', async function() {
    //get the new data
    const dataGot = await getData(dataCreated.data.id, token);

    // check if the returned data id is the good one 
    assert.strictEqual(dataCreated.data.id, dataGot.data.id);
  });
  
  it('POST /datas creates an object with fields id, data, created and modified', async function() {
    // check if dataCreated possess all the fields we want
    assert.strictEqual(201, dataCreated.status);
    assert.notEqual(undefined, dataCreated.data.created);
    assert.notEqual(undefined, dataCreated.data.modified);
    assert.notEqual(textData, JSON.stringify(dataCreated.data.data.fieldTest));
  });
  
  it('UPDATE /datas/:dataId modify the "data" and "modified" field', async function() {
    // update the data Created
    const newTextData = "newTest";
    await axios.put(urlHttp + '/datas/' + dataCreated.data.id, {data: {fieldTest: newTextData}},{ headers: { Authorization: `jwt ${token}` }})
      .then(async (res) => {
        return res;
      })
      .catch((error) => {
        console.error(error)
        assert.fail();
      });
    // get the data modified
    const dataGot = await getData(dataCreated.data.id, token);

    // check if the data has been updated
    assert.strictEqual(newTextData, dataGot.data.data.fieldTest);
  });
  
  it('DELETE /datas/:dataId add a "deleted" field', async function() {
    // delete the data
    await axios.delete(urlHttp + '/datas/' + dataCreated.data.id, {headers: {Authorization: `jwt ${token}`}})
      .then(async (res) => {
        return res;
      })
      .catch((error) => {
        console.error(error)
        assert.fail();
      });

    // get the data deleted
    const dataGot = await getData(dataCreated.data.id, token);

    // check if data had no deleted field before the test and now has one
    assert.notEqual(undefined, dataGot.data.deleted);
    assert.strictEqual(undefined, dataCreated.data.deleted);
  });
});