const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/post');

module.exports = {
    getAllPosts: async (req, res, next) => {
        try {
            const { posts } = await readAll();

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
            const { post } = await readOne({ _id: postId });

            res.status(200).json({
                post: post,
            });
        }catch (e){
            next(e);
        }
    },

    createPost: async (req, res, next) => {
        const { title, content } = req.body;
        const { userId } = req;

        try {
            await createOne({ title, content }, userId);

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
        const { userId } = req;

        try {
            await updateOne(postId, post, userId);

            res.status(201).json({
                msg: `Post ${postId} updated`,
            });
        }catch (e){
            next(e);
        }
    },

    deleteAllPosts: async (req, res, next) => {
        try {
            await deleteAll();

            res.status(201).json({
                msg: `Posts deleted`
            });
        } catch (e){
            next(e);
        }
    },

    deletePost: async (req, res, next) => {
        const { postId } = req.params;
        const { userId } = req;

        try {
            await deleteOne(postId, userId);

            res.status(201).json({
                msg: `Post ${postId} deleted`
            });
        }catch (e){
            next(e);
        }
    },
};