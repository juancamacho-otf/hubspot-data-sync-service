const express = require('express');
const router = express.Router();
const { upsertContact } = require('../controllers/contact.controller');

router.post('/', upsertContact);

module.exports = router;
