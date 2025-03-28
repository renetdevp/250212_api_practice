const router = require('express').Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUser);
router.post('/', userController.createUser);
router.put('/:userId', authMiddleware, userController.updateUser);
router.delete('/', userController.deleteAllUsers);
router.delete('/:userId', authMiddleware, userController.deleteUser);

module.exports = router;