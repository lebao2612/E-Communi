const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');


//GET 
router.get('/getPostById', postController.getPostsByUserId);

router.get('/getAllPosts', postController.getAllPosts);

router.post('/upPost', authMiddleware, postController.upPost);

router.get('/getNewsFeed', authMiddleware, postController.getNewsFeed);

module.exports = router;