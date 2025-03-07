const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/post');
const { isValid: isObjectId } = require('mongoose').Types.ObjectId;

router.get('/', async (req, res, next) => {
    try {
        const [code, msg, posts] = await readAll();

        res.status(code).json({
            posts: posts,
        });
    }catch (e){console.error(e);
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
    const { post } = req.body;

    try {
        const [code, msg] = await updateOne(postId, post);

        res.status(code).json({
            msg: msg,
        });
    }catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
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
    
    try {
        const [code, msg] = await deleteOne(postId);

        res.status(code).json({
            msg: msg
        });
    }catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

module.exports = router;