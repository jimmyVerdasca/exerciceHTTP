const express = require('express');
require('dotenv/config');
const {port} = require('./config');
const api = require('./routes/api');

const app = express();

app.use('/api', api);

app.listen(port, () => {
    console.log(`plop ${port}`);
});