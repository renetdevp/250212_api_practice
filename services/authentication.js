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
        return createErrorResponse(400, 'Invalid User Format');
    }

    try {
        const user = await User.findOne({ userId }, { hash: 1, salt: 1 }).lean();
        if (!user){
            return createErrorResponse(404, `User ${userId} not found`);
        }

        const { encrypted } = await encryptPassword(password, user.salt);

        if (!isEqual(encrypted, user.hash)){
            return createErrorResponse(401, 'Failed to Authenticate');
        }

        const token = await sign(userId);

        return {
            err: null,
            token: token,
        };
    }catch (e){
        return createErrorResponse(e.code, e.msg, e.details);
    }
}

/**
 * 
 * @param {String} encrypted 
 * @param {String} hash 
 * @returns {Boolean}
 */
function isEqual(encrypted, hash){
    if (encrypted.length !== hash.length){
        return false;
    }

    const encryptedBuffer = Buffer.from(encrypted);
    const userHashBuffer = Buffer.from(hash);

    return timingSafeEqual(encryptedBuffer, userHashBuffer);
}

/**
 * 
 * @param {Number} code errCode
 * @param {String} msg errMessage
 * @param {String|undefined} details 
 * @returns {Object}
 */
function createErrorResponse(code, msg, details=undefined){
    return {
        err: {
            code,
            msg,
        },
        token: null,
        details,
    };
}

module.exports = {
    authenticate,
};