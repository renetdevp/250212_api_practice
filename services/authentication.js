const { timingSafeEqual } = require('crypto');
const { User } = require('../models/user');
const { encryptPassword, isValidUserFormat } = require('../services/user');
const { sign } = require('./jwt');

/**
 * 
 * @param {String} userId 
 * @param {String} password 
 * @returns {Object} { token: string|null }
 */
async function authenticate(userId, password){
    if (!isValidUserFormat({ userId, hash: password })){
        throw createErrorResponse(400, 'Invalid User Format');
    }

    const user = await User.findOne({ userId }, { hash: 1, salt: 1 }).lean();
    if (!user){
        throw createErrorResponse(404, `User ${userId} not found`);
    }

    // user.hash를 String 타입으로 사용할 때, models/user.js의 encryptPassword 함수 내 주석 참조
    const { encrypted } = await encryptPassword(password, user.salt);
    // user.hash를 Buffer 타입으로 사용할 때
    // const { encrypted } = await encryptPassword(password, user.salt.buffer);

    if (!isEqual(encrypted, user.hash)){
        throw createErrorResponse(401, 'Failed to Authenticate');
    }

    const token = await sign(userId);

    return {
        token: token,
    };
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
    const err = new Error();

    err.code = code;
    err.msg = msg;
    err.details = details;

    return err;
}

module.exports = {
    authenticate,
};