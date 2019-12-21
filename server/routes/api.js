const express = require('express');

const router = express.Router();

router.get('/welcome', (req, res) => {
    res.send({ message: 'plop'});
});

router.get('/plop', (req, res) => {
    res.send({plop: null});
});

module.exports = router;