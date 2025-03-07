const router = require('express').Router();
const { authenticate } = require('../services/authentication');

router.post('/', async (req, res, next) => {
    const { userId, hash } = req.body;

    try {
        const [code, msg, token] = await authenticate(userId, hash);

        res.status(code).json({
            token: token
        });
    }catch (e){
        const [code, msg] = e;
        next({ code: code, msg: msg });
    }
});

module.exports = router;