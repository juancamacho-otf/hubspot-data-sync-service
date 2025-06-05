const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');

// POST: Create or update company and associate contacts
router.post('/', companyController.handleCompanyUpsert);

module.exports = router;
