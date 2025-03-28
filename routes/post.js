const router = require('express').Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', postController.getAllPosts);
router.get('/:postId', postController.getPost);
router.post('/', authMiddleware, postController.createPost);
router.put('/:postId', authMiddleware, postController.updatePost);
router.delete('/', postController.deleteAllPosts);
router.delete('/:postId', authMiddleware, postController.deletePost);

module.exports = router;