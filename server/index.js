const express = require('express');
require('dotenv/config');
const {port} = require('./config');
const api = require('./routes/api');
const auth = require('./auth');
const passport = require('passport');

// initialize express and passport (for connexion strategies)
const app = express();
app.use(express.json());
app.use(passport.initialize());

// link route files to a path
app.use('/auth', auth);
app.use('/', api);

// default error response (avoid sending the stacktrace to the client)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('error');
});

// start server
app.listen(port, () => {
    console.log(`server listening at port: ${port}`);
});