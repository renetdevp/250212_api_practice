const router = require('express').Router();
const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/user');

router.get('/', async (req, res, next) => {
    try {
        const { err, users } = await readAll();

        if (err){
            return next(err);
        }

        res.status(200).json({
            users: users
        });
    } catch (e){
        next(e);
    }
});

router.get('/:userId', async (req, res, next) => {
    const { userId } = req.params;

    try {
        const { err, user } = await readOne({ userId: userId });

        if (err){
            return next(err);
        }

        res.status(200).json({
            user: user
        });
    } catch(e) {
        next(e);
    }
});

router.post('/', async (req, res, next) => {
    const { userId, hash } = req.body;

    try {
        const { err } = await createOne(userId, hash);

        if (err){
            return next(err);
        }

        res.status(201).json({
            msg: `User ${userId} created`,
        });
    }catch (e){
        next(e);
    }
});

router.put('/:userId', async (req, res, next) => {
    const { userId } = req.params;
    const { user } = req.body;

    try {
        const { err } = await updateOne(userId, user);

        if (err){
            return next(err);
        }

        res.status(201).json({
            msg: `User ${userId} updated`
        });
    } catch (e){
        next(e);
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const { err } = await deleteAll();

        if (err){
            return next(err);
        }

        res.status(201).json({
            msg: 'Users deleted',
        });
    } catch (e){
        next(e);
    }
});

router.delete('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;

        const { err } = await deleteOne(userId);

        if (err){
            return next(err);
        }

        res.status(201).json({
            msg: `User ${userId} deleted`,
        });
    } catch (e){
        next(e);
    }
});

module.exports = router;