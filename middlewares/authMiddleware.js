const { verify } = require('../services/jwt');

async function authMiddleware(req, res, next){
    const userAuth = req.headers.authorization;

    if (!isValidUserAuth(userAuth)){
        return res.status(401).json({
            msg: 'Unauthorized'
        });
    }

    try {
        const userId = await verify(userAuth);

        req.userId = userId;

        next();
    }catch (e){
        return res.status(403).json({
            msg: e.msg,
        });
    }
}

function isValidUserAuth(userAuth){
    if (!userAuth){
        return false;
    }

    if (typeof userAuth !== 'string'){
        return false;
    }

    return true;
}

module.exports = authMiddleware;