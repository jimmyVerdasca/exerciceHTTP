const assert = require('assert');

describe('/users test', function() {
  it('/users can create a new user', function() {
    assert.strictEqual(1, 1);
  });
});

describe('/auth/login test', function() {
  it('/auth/login return a valid JWT token', function() {
    assert.strictEqual(1, 1);
  });
});

describe('/datas GET test', function() {
  it('GET /datas without token returns unauthorized', function() {
    assert.strictEqual(1, 1);
  });
});

describe('/datas/:dataId GET test', function() {
  it('GET /datas/:dataId return the data with given dataId', function() {
    assert.strictEqual(1, 1);
  });
});

describe('/datas POST test', function() {
  it('POST /datas creates an object with fields id, data, created and modified', function() {
    assert.strictEqual(1, 1);
  });
});

describe('/datas/:dataId UPDATE test', function() {
  it('UPDATE /datas/:dataId modify the "data" and "modified" field', function() {
    assert.strictEqual(1, 1);
  });
});

describe('/datas/:dataId DELETE test', function() {
  it('DELETE /datas/:dataId add a "deleted" field', function() {
    assert.strictEqual(1, 1);
  });
});