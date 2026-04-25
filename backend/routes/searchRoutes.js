const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { validateSearchQuery } = require('../middleware/searchValidation');

// Define search route
router.get('/', validateSearchQuery, searchController.search);

module.exports = router;
