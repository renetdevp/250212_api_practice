const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/post');
const { isValid: isObjectId } = require('mongoose').Types.ObjectId;

router.get('/', async (req, res, next) => {
    try {
        const code = [code, msg, posts] = await readAll();

        res.status(code).json({
            posts: posts,
        });
    }catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

router.get('/:postId', async (req, res, next) => {
    const { postId } = req.params;

    try {
        const [code, msg, post] = await readOne({ _id: postId });

        res.status(code).json({
            post: post,
        });
    }catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

router.post('/', async (req, res, next) => {
    const { post } = req.body;
    const userAuth = req.headers.authorization;

    try {
        const [code, msg] = await createOne(post, userAuth);

        res.status(code).json({
            msg: msg,
        });
    }catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

router.put('/:postId', async (req, res, next) => {
    const { postId } = req.params;
    
    if (!isObjectId(postId)){
        return res.status(400).json({
            msg: 'Invalid postId input'
        });
    }

    try {
        const result = await updateOne(postId);
        let code = -1, msg = '';

        if (result === 0){
            code = 200;
            msg = `Post ${postId} updated`;
        }else if (result === -1){
            code = 404;
            msg = `Post ${postId} not found`;
        }else throw new Error('Error while update Post');

        res.status(code).json({
            msg,
        });
    }catch (e){
        next({
            msg: `Failed to update post ${postId}`
        });
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const result = await deleteAll();

        if (!result){
            throw new Error('Error while delete Posts');
        } else {
            res.status(200).json({
                msg: 'Posts deleted'
            });
        }
    } catch (e){
        next({
            msg: 'Failed to delete Posts'
        });
        // res.status(500).json({
        //     msg: 'Server Error: failed to delete Posts'
        // });
    }
});

router.delete('/:postId', async (req, res, next) => {
    const { postId } = req.params;
    
    if (!isObjectId(postId)){
        return res.status(400).json({
            msg: 'Invalid postId input'
        });
    }

    try {
        const result = await deleteOne(postId);

        if (!result){
            throw new Error(`Error while delete Post ${postId}`);
        } else {
            res.status(200).json({
                msg: 'Posts deleted'
            });
        }
    } catch (e){
        next({
            msg: `Failed to delete Post ${postId}`
        });
        // res.status(500).json({
        //     msg: 'Server Error: failed to delete Posts'
        // });
    }
});

module.exports = router;