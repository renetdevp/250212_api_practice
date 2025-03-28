const router = require('express').Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUser);
router.post('/', userController.createUser);
router.put('/:userId', userController.updateUser);
router.delete('/', userController.deleteAllUsers);
router.delete('/:userId', userController.deleteUser);

module.exports = router;