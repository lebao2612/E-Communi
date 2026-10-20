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

router.post('/', authMiddleware, validateCreatePostBody, postController.upPost);

router.get('/feed', authMiddleware, validateGetNewsFeedQuery, postController.getNewsFeed);

router.get('/detail/:id', validatePostIdParam, postController.getSinglePost);
router.put('/:id/like', authMiddleware, validatePostIdParam, postController.toggleLike);

module.exports = router;