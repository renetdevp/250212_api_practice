const router = require('express').Router();
const { readOne } = require('../services/user');

router.post('/', async (req, res, next) => {
    const { userId, hash } = req.body;
    
    if ((typeof userId !== 'string') || (typeof hash !== 'string')){
        return res.status(400).json({
            msg: 'Invalid input'
        });
    }

    try {
        const result = await readOne({ userId, hash });
        let code = -1, msg = '';

        if (result === -1) throw new Error(`Error while read User ${userId}`);
        else if (result === 0){
            code = 404;
            msg = `User ${userId} not exists`;
        }else {
            //  make jwt_token use result.id, jwtSecret and expiredTime.
            const token = 'hos still alive';

            code = 201;
            msg = token;
        }

        res.status(code).json({
            msg
        });
    }catch (e){
        next({
            msg: `Failed to authenticate User ${userId}`
        });
    }
});

module.exports = router;