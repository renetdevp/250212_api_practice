const router = require('express').Router();
const jwt = require('jsonwebtoken');
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

        if (result === -1) throw new Error(`Error while read User ${userId}`);
        else if (result === 0){
            return res.status(404).json({
                msg: `User ${userId} not exists`
            });
        }else {
            //  make jwt_token use result.id, jwtSecret and expiredTime.
            const jwtSecret = process.env.jwtSecret || 'thisissecret';
            const jwtOption = {
                algorithm: 'HS512',
                expiresIn: '1h',
            };
            //  https://stackoverflow.com/a/56872864, jwt.sign()은 callback 함수가 제공되면 비동기로, 제공되지 않으면 동기식으로 작동함
            jwt.sign({ userId: result.userId }, jwtSecret, jwtOption, (err, token) => {
                if (err){
                    return next({ msg: `Failed to sign JWT`});
                }

                res.status(201).json({
                    msg: token
                });
            });
        }
    }catch (e){
        next({
            msg: `Failed to authenticate User ${userId}`
        });
    }
});

module.exports = router;