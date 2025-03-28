const { authenticate } = require('../services/authentication');

module.exports = {
    createToken: async (req, res, next) => {
        const { userId, hash } = req.body;

        try {
            const { token } = await authenticate(userId, hash);

            res.status(201).json({
                token: token
            });
        }catch (e){
            next(e);
        }
    },
};