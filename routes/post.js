const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/post');
const { isValid: isObjectId } = require('mongoose').Types.ObjectId;

router.get('/', async (req, res, next) => {
    try {
        const posts = await readAll();    //can be null

        res.status(200).json({
            posts: posts
        });
    } catch (e){
        next({
            msg: 'Error while read posts'
        });
        // res.status(500).json({
        //     msg: 'Error while read posts'
        // });
    }
});

router.get('/:postId', async (req, res, next) => {
    const { postId } = req.params;

    if (!isObjectId(postId)){
        return res.status(400).json({
            msg: 'Invalid postId input'
        });
    }

    try {
        const post = await readOne(postId);
        let code = -1, msg = '';

        if (!post){
            code = 404;
            msg = `Post ${postId} not found`;
        }else {
            code = 200;
            msg = `Post ${postId} found`
        }

        res.status(code).json({
            msg,
            post,
        });
    }catch (e){
        next({
            msg: `Failed to read post ${postId}`
        });
    }
});

router.post('/', (req, res, next) => {
        const { post } = req.body;

        if (!post || (typeof(post?.title) != 'string') || (typeof(post?.content) != 'string')){
            return res.status(400).json({
                msg: 'Invalid Post format'
            });
        }

        //future work: get user_info from jwt token and validate with jwt
        
        // const user = new (require('mongoose').Types.ObjectId);
        const userAuth = req.headers.authorization;
        if (!userAuth || (typeof(userAuth) != 'string')){
            return res.status(400).json({
                msg: 'Invalid Authorization'
            });
        }

        const jwtSecret = process.env.jwtSecret || 'thisissecret';
        const jwtOption = {
            algorithms: 'HS512'
        };

        jwt.verify(userAuth, jwtSecret, jwtOption, async (err, decoded) => {
            try {
                if ((err?.name === 'TokenExpiredError') || (err?.name === 'JsonWebTokenError')){
                    return res.status(400).json({
                        msg: 'Invalid JWT'
                    });
                }

                const result = await createOne(post, decoded.userId);

                if (result != 0) throw new Error('error while create post');

                return res.status(201).json({
                    msg: 'post created'
                });
            }catch (e){
                next({
                    msg: 'Failed to create post'
                });
            }
        });
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