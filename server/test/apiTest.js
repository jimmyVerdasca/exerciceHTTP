const assert = require('assert');
const axios = require('axios')
require('dotenv/config');
const {port, jwtOptions} = require('../config');
const jwt = require('jsonwebtoken');
const cleanOne = require("../db").cleanOne;

const url = `http://localhost:${port}`;
const username = "adminTest";
const password = "adminTest";

async function createData(data, token, cb) {
  return await axios.post(url + '/datas', {data: data}, {headers: { Authorization: `jwt ${token}`}})
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.error(error)
      assert.fail();
    });
}

async function getData(id, token) {
  return await axios.get(url + '/datas/' + id,{ headers: { Authorization: `jwt ${token}` }})
    .then(async (res) => {
      return res;
    })
    .catch((error) => {
      console.error(error)
      assert.fail();
    });
}

async function createUser(cb) {
    return await axios.post(url + '/users', {username: username, password: password})
    .then((res) => {
      cb(res.data);
    })
    .catch((error) => {
      console.error(error)
      assert.fail();
      done();
    });
}

async function logIn(user) {
  return await axios.post(url + '/auth/login', {username: user.username, password: user.password})
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
    createUser(async (response) => {
      user = response;
      token = await logIn(user);
      dataCreated = await createData(data, token);
      done();
    });
  });

  afterEach(function(done) {
    cleanOne('datas', dataCreated.data.id, () => {
      dataCreated = null;
      cleanOne('users', user.id, () => {
        user = null;
        done();
      })
    });
  });

  it('/users can create a new user', async function() {
    assert.strictEqual(username, user.username);
    assert.strictEqual(password, user.password);
    assert.notEqual(null, user.id);
    assert.notEqual(undefined, user.id);
  });
  
  it('/auth/login return a valid JWT token', async function() {
    const token = await logIn(user);
    var decoded = jwt.verify(token, jwtOptions.secret);
    assert.notEqual(undefined, decoded.userId);
    assert.notEqual(undefined, decoded.iat);
    assert.notEqual(undefined, decoded.exp);
  });

  it('GET /datas without token returns 401 Unauthorized', async function() {
    const response = await axios.get(url + '/datas')
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
    assert.strictEqual("Unauthorized", response.response.statusText);
    assert.strictEqual(401, response.response.status);
  });

  it('GET /datas/:dataId return the data with given dataId', async function() {
    //get the new data
    const dataGot = await getData(dataCreated.data.id, token);

    assert.strictEqual(dataCreated.data.id, dataGot.data.id);
  });
  
  it('POST /datas creates an object with fields id, data, created and modified', async function() {
    assert.strictEqual(201, dataCreated.status);
    assert.notEqual(undefined, dataCreated.data.created);
    assert.notEqual(undefined, dataCreated.data.modified);
    assert.notEqual(textData, JSON.stringify(dataCreated.data.data.fieldTest));
  });
  
  it('UPDATE /datas/:dataId modify the "data" and "modified" field', async function() {
    // update the data Created
    const newTextData = "newTest";
    await axios.put(url + '/datas/' + dataCreated.data.id, {data: {fieldTest: newTextData}},{ headers: { Authorization: `jwt ${token}` }})
      .then(async (res) => {
        return res;
      })
      .catch((error) => {
        console.error(error)
        assert.fail();
      });
    //get the data modified
    const dataGot = await getData(dataCreated.data.id, token);
    assert.strictEqual(newTextData, dataGot.data.data.fieldTest);
  });
  
  it('DELETE /datas/:dataId add a "deleted" field', async function() {
    // delete the data
    await axios.delete(url + '/datas/' + dataCreated.data.id, {headers: {Authorization: `jwt ${token}`}})
      .then(async (res) => {
        return res;
      })
      .catch((error) => {
        console.error(error)
        assert.fail();
      });

    //get the data deleted
    const dataGot = await getData(dataCreated.data.id, token);
    assert.notEqual(undefined, dataGot.data.deleted);
    assert.strictEqual(undefined, dataCreated.data.deleted);
  });
});