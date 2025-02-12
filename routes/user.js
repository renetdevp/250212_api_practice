const router = require('express').Router();
const crypto = require('crypto');
const { createOne, readOne, readAll, updateOne, deleteOne, deleteAll } = require('../services/user');

router.get('/', async (req, res, next) => {
    try {
        const users = await readAll();

        res.status(200).json({
            users: users
        });
    } catch (e){
        next({
            msg: 'Falied to read Users'
        });
        // res.status(500).json({
        //     msg: 'Server Error: Falied to read Users'
        // });
    }
});

router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
    
        const result = await readOne({ userId: userId });
        
        if (result === -1){
            throw new Error(`Error while read User ${userId}`);
        }else if (result === 0){
            res.status(404).json({
                msg: `User ${userId} not found`
            });
        }else {
            res.status(200).json({
                user: result
            });
        }
    } catch(e) {
        next({
            msg: `Failed to read User ${userId}`
        });
        // res.status(500).json({
        //     msg: 'Server Error: Failed to read User'
        // });
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { userId, hash } = req.body;
        const salt = '[tempSalt]';  //  randomly generated by attempt
        let code = -1, msg = '';

        crypto.PBKDF2(hash, salt, 310000, 32, 'sha512', (err, derivedKey) => {
            console.log(`derived Key through pbkdf2 from ${hash} to ${derivedKey}`);
        });

        const result = await createOne(userId, hash);

        if (result === 0){
            code = 200;
            msg = `User ${userId} created`
        } else if (result === -1){
            code = 400;
            msg = 'Invalid User Format';
        } else if (result === -2){
            code = 409;
            msg = `User ${userId} already exists`;
        } else {
            throw new Error('Error while Create User');
        }

        res.status(code).json({
            msg
        });
    } catch (e){
        next({
            msg: 'Failed to create User'
        });
        // res.status(500).json({
        //     msg: 'Server Error: Failed to create User'
        // });
    }
});

router.put('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { user } = req.body;
    
        const result = await updateOne(userId, user);

        let code = -1, msg = '';

        if (result === 0){
            code = 200;
            msg = `User ${userId} successfully updated`
        }else if (result === -1){
            code = 404;
            msg = `User ${userId} is not exist`
        }else if (result === -2){
            throw new Error(`Error while Update User ${userId}`);
        }

        res.status(code).json({
            msg
        });
    } catch (e){
        next({
            msg: `Failed to Update User ${userId}`
        });
        // res.status(500).json({
        //     msg: `Server Error: Failed to Update User ${id}`
        // });
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
        // res.status(500).json({
        //     msg: 'Server Error: Failed to delete Users'
        // });
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
        // res.status(500).json({
        //     msg: `Server Error: Failed to delete User ${id}`
        // });
    }
});

module.exports = router;