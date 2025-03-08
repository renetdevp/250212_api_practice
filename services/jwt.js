const jwt = require('jsonwebtoken');
const { timingSafeEqual } = require('crypto');
const { User, encryptPassword, isValidUserFormat } = require('../models/user');

const jwtSecret = process.env.jwtSecret || 'thisisSecret';
const jwtOption = {
    algorithm: 'HS512',
    expiresIn: '1h',
};

/**
 * 
 * @param {String} userId
 * @returns 
 */
function sign(userId){
    return new Promise((resolve, reject) => {
        //  https://stackoverflow.com/a/56872864, jwt.sign()은 callback 함수가 제공되면 비동기로, 제공되지 않으면 동기식으로 작동함
        jwt.sign({ userId: userId }, jwtSecret, jwtOption, (err, token) => {
            if (err){
                return reject(new Error('Error while sign JWT'));
            }

            resolve(token);
        });
    });
}

/**
 * 
 * @param {String} userAuth
 * @returns {Array} [code: Number, ]
 */
function verify(userAuth){
    return new Promise((resolve, reject) => {
        jwt.verify(userAuth, jwtSecret, jwtOption, (err, decoded) => {
            if (err){
                return reject(getJWTErrorCode(err.name));
            }

            return resolve([200, decoded.userId]);
        });
    });
}


function getJWTErrorCode(errName){
    const errMap = {
        'TokenExpiredError': [400, 'JWT expired'],
        'JsonWebTokenError': [400, 'Invalid JWT'],
    };

    if (!!errMap[errName]){
        return errMap[errName];
    }

    return [500, 'Error while verify JWT'];
}

const jwtService = {
    sign,
    verify,
};

module.exports = jwtService;