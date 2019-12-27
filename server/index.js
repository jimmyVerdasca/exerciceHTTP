const express = require('express');
require('dotenv/config');
const {port} = require('./config');
const api = require('./routes/api');
const auth = require('./auth');
const passport = require('passport');

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.use('/auth', auth);
app.use('/', api);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('error');
});

app.listen(port, () => {
    console.log(`server listening at port: ${port}`);
});