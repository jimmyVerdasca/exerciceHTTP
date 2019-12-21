const express = require('express');

const router = express.Router();

router.post('/login', (req, res) => {
    throw new Error('test');
    const {username, password} = req.body;
    res.send({username, password: '****'});
});

module.exports = router;