const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');
const {
	validateGetNewsFeedQuery,
	validateGetPostsByUserQuery,
	validateCreatePostBody,
	validatePostIdParam,
} = require('../middleware/postValidation');


//GET 
router.get('/', postController.getAllPosts);
router.get('/getPostById', validateGetPostsByUserQuery, postController.getPostsByUserId);

router.get('/getAllPosts', postController.getAllPosts);

router.post('/', authMiddleware, validateCreatePostBody, postController.upPost);
router.post('/upPost', authMiddleware, validateCreatePostBody, postController.upPost);

router.get('/feed', authMiddleware, validateGetNewsFeedQuery, postController.getNewsFeed);
router.get('/getNewsFeed', authMiddleware, validateGetNewsFeedQuery, postController.getNewsFeed);

router.put('/:id/like', authMiddleware, validatePostIdParam, postController.toggleLike);

module.exports = router;