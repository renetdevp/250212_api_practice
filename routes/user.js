const router = require('express').Router();
const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/user');

router.get('/', async (req, res, next) => {
    try {
        const [code, msg, users] = await readAll();

        res.status(200).json({
            users: users
        });
    } catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;

        const [code, msg, user] = await readOne({ userId: userId });

        res.status(code).json({
            user: user
        });
    } catch(e) {
        const [code, msg] = e;
        next({ code: code, msg: msg });
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
    try {
        const { userId } = req.params;
        const { user } = req.body;
    
        const [code, msg] = await updateOne(userId, user);

        res.status(code).json({
            msg
        });
    } catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const [code, msg] = await deleteAll();

        res.status(code).json({
            msg: msg,
        });
    } catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

router.delete('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;

        const [code, msg] = await deleteOne(userId);

        res.status(code).json({
            msg: msg,
        });
    } catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

module.exports = router;