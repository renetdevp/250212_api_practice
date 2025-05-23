const { User } = require('../models/user');
const { randomBytes, pbkdf2 } = require('crypto');

/**
 * Create user(userId) with userId,hash
 * 
 * @param {String} userId
 * @param {String} hash
 */
async function createOne(userId, hash){
    if (!isValidUserFormat({ userId, hash })){
        throw createErrorResponse(400, 'Invalid User Format');
    }

    const alreadyExist = await User.exists({ userId });
    if (!!alreadyExist){
        throw createErrorResponse(409, `User ${userId} already exist`);
    }

    const { salt, encrypted } = await encryptPassword(hash);

    await User.create({ userId, hash: encrypted, salt });
}

/**
 * Read user(userId) with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Object} { user: Object | undefined }
 */
async function readOne(filter = {}, projection = { userId: 1, _id: 0 }){
    if (!isValidUserId(filter?.userId)){
        return createErrorResponse(400, 'Invalid userId');
    }

    const user = await User.findOne(filter, projection).lean();

    if (isEmptyUser(user)){
        throw createErrorResponse(404, `User ${filter.userId} not found`);
    }

    return { user };
}

/**
 * Read all user with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Object} { user: Array | undefined}
 */
async function readAll(filter = {}, projection = { userId: 1, _id: 0 }){
    const users = await User.find(filter, projection).lean();

    return { users };
}

/**
 * Update user(userId)
 * 
 * @param {String} userId
 * @param {Object} modification
 * @param {String} userAuth
 * @returns
 */
async function updateOne(userId, modification, decodedUserId){
    if (!isValidUserId(userId)){
        throw createErrorResponse(400, 'Invalid userId format');
    }

    if (userId !== decodedUserId){
        throw createErrorResponse(403, 'Forbidden');
    }

    const conformedUser = await conformUser(modification);

    if (!conformedUser){
        throw createErrorResponse(400, 'Invalid modification format');
    }

    const result = await User.updateOne({ userId }, conformedUser);

    if (result.modifiedCount === 0){
        throw createErrorResponse(404, `User ${userId} not found`);
    }
}

/**
 * Delete user(userId) with userId
 * 
 * @param {String} userId 
 * @param {String} userAuth
 * @returns
 */
async function deleteOne(userId, decodedUserId){
    if (!isValidUserId(userId)){
        throw createErrorResponse(400, 'Invalid userId');
    }

    if (decodedUserId !== userId){
        throw createErrorResponse(403, 'Forbidden');
    }

    const result = await User.deleteOne({ userId }).exec();

    if (result.deletedCount === 0){
        throw createErrorResponse(404, `User ${userId} not found`);
    }
}

/**
 * Delete All User with filter
 * 
 * @param {Object} filter 
 * @returns
 */
async function deleteAll(filter = {}){
    await User.deleteMany(filter).exec();
}

/**
 * Encrypt password
 * 
 * @param {String} password 
 * @param {undefined|String} salt default: undefined
 * @returns {Promise<object>} { err: object|null, salt: String, derivedKey: String }
 */
function encryptPassword(password, salt=undefined){
    return new Promise((resolve, reject) => {
        // .toString('hex')를 사용하지 않으면 동일한 결과값이 나오지 않음
        // 이는 crypto.randomBytes()가 Buffer 객체를 반환하기 때문에 발생함
        // 나는 user model에서 salt를 String type으로 지정했고, buffer string이 어떤 방식으로 저장될지 따로 정의하지 않음
        // 이로 인해 salt가 저장되는 형식이 고정되지 않아 로그인 시 User.findOne()으로 찾아오는 salt 값이 User.create()로 생성한 salt 값과 차이가 있을 수 있음

        // user 모델의 salt를 Buffer 타입으로 사용할거라면 .toString()이 필요치 않으나, 이 경우 findOne으로 찾아온 salt의 타입이 String이나 Buffer 타입이 아니므로 salt.buffer를 써야함(salt.buffer는 buffer 타입임)
        // user 모델의 salt를 String 타입으로 사용할거라면 .toString()을 사용해야 함. 사용하지 않아도 mongodb에 저장은 가능하나, 상기된 사유로 저장할 때와 비교할 때의 값이 달라짐

        // salt를 Buffer 타입으로 사용할 때
        // const localSalt = !!salt?salt:randomBytes(16);
        // salt를 String 타입으로 사용할 때
        const localSalt = !!salt?salt:randomBytes(16).toString('hex');
        const hashAlgorithm = process.env.hashAlgorithm || 'sha512';

        pbkdf2(password, localSalt, 310000, 32, hashAlgorithm, (err, derivedKey) => {
            if (err){
                return reject({
                    err: {
                        code: 500,
                        msg: 'Failed to encrypt password'
                    },
                });
            }

            resolve({
                err: null,
                salt: localSalt,
                encrypted: derivedKey.toString('hex'),
            });
        });
    });
}

function isValidUserFormat(user){
    if (!user){
        return false;
    }

    if (typeof user.userId !== 'string'){
        return false;
    }

    if (typeof user.hash !== 'string'){
        return false;
    }

    return true;
}

function isEmptyUser(user){
    if (!user) return true;
    if (Object.keys(user).length === 0) return true;

    return false;
}

function isValidUserId(userId){
    if (!userId){
        return false;
    }

    if (typeof userId !== 'string'){
        return false;
    }

    return true;
}

/**
 * 
 * @param {Object} modification
 * @returns {false|Object}
 */
async function conformUser(modification){
    let result = {};

    if (!modification){
        return false;
    }

    const { userId, hash } = modification;

    if (userId !== undefined){
        result.userId = userId;
    }

    if (hash !== undefined && typeof hash === 'string'){
        const { salt, encrypted } = await encryptPassword(hash);

        result.salt = salt;
        result.hash = encrypted;
    }

    if (Object.keys(result).length === 0){
        return false;
    }

    return result;
}

/**
 * 
 * @param {Number} code 
 * @param {String} msg 
 * @param {String|undefined} details default: undefined
 */
function createErrorResponse(code, msg, details=undefined){
    const err = new Error();

    err.code = code;
    err.msg = msg;
    err.details = details;

    return err;
}

module.exports = {
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteAll,
    encryptPassword,
    isValidUserFormat,
};