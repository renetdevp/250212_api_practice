const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/post');

module.exports = {
    getAllPosts: async (req, res, next) => {
        try {
            const { err, posts } = await readAll();

            if (err){
                return next(err);
            }

            res.status(200).json({
                posts,
            });
        }catch (e){
            next(e);
        }
    },

    getPost: async (req, res, next) => {
        const { postId } = req.params;

        try {
            const { err, post } = await readOne({ _id: postId });

            if (err){
                return next(err);
            }

            res.status(200).json({
                post: post,
            });
        }catch (e){
            next(e);
        }
    },

    createPost: async (req, res, next) => {
        const { title, content } = req.body;
        const userAuth = req.headers.authorization;

        try {
            const { err } = await createOne({ title, content }, userAuth);

            if (err){
                return next(err);
            }

            res.status(201).json({
                msg: `Post ${title} created`,
            });
        }catch (e){
            next(e);
        }
    },

    updatePost: async (req, res, next) => {
        const { postId } = req.params;
        const { post } = req.body;
        const userAuth = req.headers.authorization;

        try {
            const { err } = await updateOne(postId, post, userAuth);

            if (err){
                return next(err);
            }

            res.status(201).json({
                msg: `Post ${postId} updated`,
            });
        }catch (e){
            next(e);
        }
    },

    deleteAllPosts: async (req, res, next) => {
        try {
            const { err } = await deleteAll();

            if (err){
                return next(err);
            }

            res.status(201).json({
                msg: `Posts deleted`
            });
        } catch (e){
            next(e);
        }
    },

    deletePost: async (req, res, next) => {
        const { postId } = req.params;
        const userAuth = req.headers.authorization;

        try {
            const { err } = await deleteOne(postId, userAuth);

            if (err){
                return next(err);
            }

            res.status(201).json({
                msg: `Post ${postId} deleted`
            });
        }catch (e){
            next(e);
        }
    },
};