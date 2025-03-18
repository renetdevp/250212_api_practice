const jwt = require('jsonwebtoken');

const jwtSecret = process.env.jwtSecret || 'thisisSecret';
const jwtOption = {
    algorithm: 'HS512',
    expiresIn: '1h',
};

/**
 * 
 * @param {String} userId
 * @returns {Promise<String>}
 */
function sign(userId){
    return new Promise((resolve, reject) => {
        //  https://stackoverflow.com/a/56872864, jwt.sign()은 callback 함수가 제공되면 비동기로, 제공되지 않으면 동기식으로 작동함
        jwt.sign({ userId: userId }, jwtSecret, jwtOption, (err, token) => {
            if (err){
                return reject({
                    code: 500,
                    msg: 'Error while signing JWT',
                    details: err.message,
                });
            }

            resolve(token);
        });
    });
}

/**
 * 
 * @param {String} userAuth
 * @returns {Promise<String>}
 */
function verify(userAuth){
    return new Promise((resolve, reject) => {
        jwt.verify(userAuth, jwtSecret, jwtOption, (err, decoded) => {
            if (err){
                const errContent = jwtErrorMap(err.name);

                return reject({
                    ...errContent,
                    details: err.message,
                });
            }

            return resolve(decoded.userId);
        });
    });
}

/**
 * 
 * @param {String} errName 
 * @returns {Object}
 */
function jwtErrorMap(errName){
    const errorMap = {
        'TokenExpiredError': {
            code: 400,
            msg: 'JWT expired'
        },
        'JsonWebTokenError': {
            code: 400,
            msg: 'Invalid JWT'
        },
    };

    if (!errorMap[errName]){
        return {
            code: 500,
            msg: 'Error while verify Token'
        };
    }

    return errorMap[errName];
}

const jwtService = {
    sign,
    verify,
};

module.exports = jwtService;