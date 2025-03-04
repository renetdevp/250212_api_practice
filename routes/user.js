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
        const [code, msg] = await createOne(userId, hash);

        res.status(code).json({
            msg: msg,
        });
    }catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

router.put('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { user } = req.body;
    
        if (typeof(userId) !== 'string'){
            return res.status(400).json({
                msg: 'Invalid userId format'
            });
        }

        const result = await updateOne(userId, user);

        let code = -1, msg = '';

        if (result === 0){
            code = 200;
            msg = `User ${userId} successfully updated`
        }else if (result === -1){
            code = 400;
            msg = 'Invalid user format';
        }else if (result === -2){
            code = 404;
            msg = `User ${userId} is not exist`
        }else if (result === -3){
            throw new Error(`Error while Update User ${userId}`);
        }

        res.status(code).json({
            msg
        });
    } catch (e){
        next({
            msg: `Failed to Update User ${userId}`
        });
    }
});

router.delete('/', async (req, res, next) => {
    try {
        const result = await deleteAll();
    
        if (!result){
            throw new Error('Error while delete Users');
        }else {
            res.status(200).json({
                msg: 'Users Deleted'
            });
        }
    } catch (e){
        next({
            msg: 'Failed to delete Users'
        });
    }
});

router.delete('/:userId', async (req, res, next) => {
    const { userId } = req.params;

    if (typeof userId !== string){
        return res.status(400).json({
            msg: 'Invalid input'
        });
    }

    try {
        const result = await deleteOne(userId);

        if (!result){
            throw new Error(`Error while delete User ${userId}`);
        }else {
            res.status(200).json({
                msg: `User ${userId} Deleted`
            });
        }
    } catch (e){
        next({
            msg: `Failed to delete User ${userId}`
        });
    }
});

module.exports = router;