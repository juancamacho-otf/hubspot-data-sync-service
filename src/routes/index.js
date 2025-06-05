const express = require('express');
const router = express.Router();
const contactRoutes = require('./contact.routes');
const contactRoutescompani = require('./company.routes');

router.use('/contact', contactRoutes);
router.use('/companie', contactRoutescompani);

module.exports = router;
