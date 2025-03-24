const router = require('express').Router();

const authenticationRouter = require('./authentication');
const userRouter = require('./user');
const postRouter = require('./post');

router.use('/authentications', authenticationRouter)
router.use('/users', userRouter);
router.use('/posts', postRouter);

module.exports = router;