const router = require('express').Router();
const postController = require('../controllers/postController');

router.get('/', postController.getAllPosts);
router.get('/:postId', postController.getPost);
router.post('/', postController.createPost);
router.put('/:postId', postController.updatePost);
router.delete('/', postController.deleteAllPosts);
router.delete('/:postId', postController.deletePost);

module.exports = router;