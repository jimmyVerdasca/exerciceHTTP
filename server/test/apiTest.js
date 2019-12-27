const assert = require('assert');
const axios = require('axios')
require('dotenv/config');
const {port, jwtOptions} = require('../config');
const jwt = require('jsonwebtoken');

const url = `http://localhost:${port}`;
const username = "adminTest";
const password = "adminTest";

async function createData(textData, token) {
  return await axios.post(url + '/datas', {data: textData},{ headers: { Authorization: `jwt ${token}` }})
    .then(async (res) => {
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

async function createUser() {
    return await axios.post(url + '/users', {username: username, password: password})
    .then(async (res) => {
      return res;
    })
    .catch((error) => {
      console.error(error)
      assert.fail();
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

describe('/users test', function() {
  this.timeout(0);
  it('/users can create a new user', async function() {
    const data = await createUser();
    const user = data.data;
    assert.strictEqual(username, user.username);
    assert.strictEqual(password, user.password);
    assert.notEqual(null, user._id);
    assert.notEqual(undefined, user._id);
  });
});

describe('/auth/login test', function() {
  this.timeout(0);
  it('/auth/login return a valid JWT token', async function() {
    const data = await createUser();
    const user = data.data;
    const token = await logIn(user);
    var decoded = jwt.verify(token, jwtOptions.secret);
    assert.notEqual(undefined, decoded.userId);
    assert.notEqual(undefined, decoded.iat);
    assert.notEqual(undefined, decoded.exp);
  });
});

describe('/datas GET test', function() {
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
});

describe('/datas/:dataId GET test', function() {
  this.timeout(0);
  it('GET /datas/:dataId return the data with given dataId', async function() {
    //create a new data
    const textData = "dataTest";
    const data = await createUser();
    const user = data.data;
    const token = await logIn(user);
    const dataCreated = await createData(textData, token);

    //get the new data
    const dataGot = await getData(dataCreated.data._id, token);

    assert.strictEqual(dataCreated.data._id, dataGot.data._id);
  });
});

describe('/datas POST test', function() {
  this.timeout(0);
  it('POST /datas creates an object with fields id, data, created and modified', async function() {
    const textData = "dataTest";
    const data = await createUser();
    const user = data.data;
    const token = await logIn(user);
    const dataCreated = await createData(textData, token);

    assert.strictEqual(201, dataCreated.status);
    assert.notEqual(undefined, dataCreated.data.created);
    assert.notEqual(undefined, dataCreated.data.modified);
    assert.notEqual(textData, JSON.stringify(dataCreated.data.data));
  });
});

describe('/datas/:dataId UPDATE test', function() {
  this.timeout(0);
  it('UPDATE /datas/:dataId modify the "data" and "modified" field', async function() {
    
    // create a new data
    const textData = "dataTest";
    const data = await createUser();
    const user = data.data;
    const token = await logIn(user);
    const dataCreated = await createData(textData, token);

    // update the data Created
    const newTextData = "newTest";
    await axios.put(url + '/datas/' + dataCreated.data._id, {data: newTextData},{ headers: { Authorization: `jwt ${token}` }})
      .then(async (res) => {
        return res;
      })
      .catch((error) => {
        console.error(error)
        assert.fail();
      });
    //get the data modified
    const dataGot = await getData(dataCreated.data._id, token);
    assert.strictEqual(newTextData, dataGot.data.data);
  });
});

describe('/datas/:dataId DELETE test', function() {
  this.timeout(0);
  it('DELETE /datas/:dataId add a "deleted" field', async function() {
    
    // create a new data
    const textData = "dataTest";
    const data = await createUser();
    const user = data.data;
    const token = await logIn(user);
    const dataCreated = await createData(textData, token);

    // delete the data
    await axios.delete(url + '/datas/' + dataCreated.data._id,{ headers: { Authorization: `jwt ${token}` }})
      .then(async (res) => {
        return res;
      })
      .catch((error) => {
        console.error(error)
        assert.fail();
      });

    //get the data deleted
    const dataGot = await getData(dataCreated.data._id, token);
    assert.notEqual(undefined, dataGot.data.deleted);
    assert.strictEqual(undefined, dataCreated.data.deleted);
  });
});