const { timingSafeEqual } = require('crypto');
const { User, encryptPassword, isValidUserFormat } = require('../models/user');
const { sign } = require('./jwt');

/**
 * 
 * @param {String} userId 
 * @param {String} password 
 * @returns {Object} { err: object|null, token: string|null }
 */
async function authenticate(userId, password){
    if (!isValidUserFormat({ userId, hash: password })){
        return {
            err: {
                code: 400,
                msg: 'Invalid User Format',
            },
            token: null,
        };
    }

    try {
        const user = await User.findOne({ userId }, { hash: 1, salt: 1 }).lean();

        if (!user){
            return {
                err: {
                    code: 404,
                    msg: `User ${userId} not found`,
                },
                token: null,
            };
        }

        const { encrypted } = await encryptPassword(password, user.salt);

        if (!isEqual(encrypted, user.hash)){
            return {
                err: {
                    code: 401,
                    msg: 'Failed to Authenticate',
                },
                token: null,
            };
        }

        const token = await sign(userId);

        return {
            err: null,
            token: token,
        };
    }catch (e){
        return {
            err: {
                code: 500,
                msg: 'Error while authenticate',
            },
        };
    }
}

/**
 * 
 * @param {String} encrypted 
 * @param {String} hash 
 * @returns {Boolean}
 */
function isEqual(encrypted, hash){
    const encryptedBuffer = Buffer.from(encrypted);
    const userHashBuffer = Buffer.from(hash);

    if (!timingSafeEqual(encryptedBuffer, userHashBuffer)){
        return false;
    }

    return true;
}

module.exports = {
    authenticate,
};