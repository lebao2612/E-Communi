const express = require('express')
const router = express.Router();
const postController = require('../controllers/postController')


//GET 
router.get('/getPostById', postController.getPostsByUserId);

router.get('/getAllPosts', postController.getAllPosts);

router.post('/upPost', postController.upPost);

module.exports = router;