const router = require('express').Router();
const { authenticate } = require('../services/authentication');

router.post('/', async (req, res, next) => {
    const { userId, hash } = req.body;

    try {
        const { err, token } = await authenticate(userId, hash);
        if (err){
            return next(err);
        }

        res.status(201).json({
            token: token
        });
    }catch (e){
        next(e);
    }
});

module.exports = router;