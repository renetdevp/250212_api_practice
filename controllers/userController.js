const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/user');

module.exports = {
    getAllUsers: async (req, res, next) => {
        try {
            const { users } = await readAll();

            res.status(200).json({
                users: users
            });
        } catch (e){
            next(e);
        }
    },

    getUser: async (req, res, next) => {
        const { userId } = req.params;

        try {
            const { user } = await readOne({ userId: userId });

            res.status(200).json({
                user: user
            });
        } catch(e) {
            next(e);
        }
    },

    createUser: async (req, res, next) => {
        const { userId, hash } = req.body;

        try {
            await createOne(userId, hash);

            res.status(201).json({
                msg: `User ${userId} created`,
            });
        }catch (e){
            next(e);
        }
    },

    updateUser: async (req, res, next) => {
        const { userId } = req.params;
        const modification = req.body;
        const decodedUserId = req.userId;

        try {
            await updateOne(userId, modification, decodedUserId);

            res.status(201).json({
                msg: `User ${userId} updated`
            });
        } catch (e){
            next(e);
        }
    },

    deleteAllUsers: async (req, res, next) => {
        try {
            await deleteAll();

            res.status(204).json({
                msg: 'Users deleted',
            });
        } catch (e){
            next(e);
        }
    },

    deleteUser: async (req, res, next) => {
        const { userId } = req.params;
        const decodedUserId = req.userId;

        try {
            await deleteOne(userId, decodedUserId);

            res.status(201).json({
                msg: `User ${userId} deleted`,
            });
        } catch (e){
            next(e);
        }
    },
};