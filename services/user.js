const { User, encryptPassword } = require('../models/user');

/**
 * Create user(userId) with userId,hash
 * 
 * @param {String} userId 
 * @param {String} hash 
 * @returns {Object}
 */
async function createOne(userId, hash){
    if (!isValidUserFormat({ userId, hash })){
        return createErrorResponse(400, 'Invalid User Format');
    }

    try {
        const count = await User.countDocuments({ userId }).exec();
        if (count > 0){
            return createErrorResponse(409, `User ${userId} already exist`);
        }

        const { err, salt, encrypted } = await encryptPassword(hash);
        if (err){
            return err;
        }

        const newUser = new User({ userId, hash: encrypted, salt, });
        await newUser.save();

        return { err: null };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

/**
 * Read user(userId) with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Object} { err: Object | null, user: Object | undefined }
 */
async function readOne(filter = {}, projection = { userId: 1, _id: 0 }){
    if (!isValidUserId(filter?.userId)){
        return createErrorResponse(400, 'Invalid userId');
    }

    try {
        const user = await User.findOne(filter, projection).lean();

        if (isEmptyUser(user)){
            return createErrorResponse(404, `User ${filter.userId} not found`);
        }

        return { err: null, user };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

/**
 * Read all user with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Object} { err: Object | null, user: Array | undefined}
 */
async function readAll(filter = {}, projection = { userId: 1, _id: 0 }){
    try {
        const users = await User.find(filter, projection).lean();

        return { err: null, users };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

/**
 * Update user(userId)
 * 
 * @param {String} userId 
 * @param {Object} user 
 * @param {String} userAuth
 * @returns {Object} { err: Object | null }
 */
async function updateOne(userId, user, userAuth){
    if (!isValidUserId(userId)){
        return createErrorResponse(400, 'Invalid userId format');
    }

    if (!isValidUserFormat(user)){
        return createErrorResponse(400, 'Invalid user format');
    }

    if (!isValidUserAuth(userAuth)){
        return createErrorResponse(400, 'Invalid User Authentication');
    }

    try {
        const foundUser = await User.find({ userId }).lean();

        if (isEmptyUser(foundUser)){
            return createErrorResponse(404, `User ${userId} not found`);
        }

        const decodedUserId = await verify(userAuth);

        if (foundUser.userId !== decodedUserId){
            return createErrorResponse(403, 'Not authorizated');
        }

        await User.updateOne({ userId }, user);

        return { err: null };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

/**
 * Delete user(userId) with userId
 * 
 * @param {String} userId 
 * @param {String} userAuth
 * @returns {Object} { err: Object | null }
 */
async function deleteOne(userId, userAuth){
    if (!isValidUserId(userId)){
        return createErrorResponse(400, 'Invalid userId');
    }

    if (!isValidUserAuth(userAuth)){
        return createErrorResponse(400, 'Invalid userAuth');
    }

    try {
        const decodedUserId = await verify(userAuth);

        if (decodedUserId !== userId){
            return createErrorResponse(403, 'Not authorizated');
        }

        const result = await User.deleteOne({ userId }).exec();

        if (result.deletedCount === 0){
            return createErrorResponse(404, `User ${userId} not found`);
        }

        return { err: null };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
}

/**
 * Delete All User with filter
 * 
 * @param {Object} filter 
 * @returns {Object} { err: Object | null }
 */
async function deleteAll(filter = {}){
    try {
        await User.deleteMany(filter).exec();

        return { err: null };
    }catch (e){
        return createErrorResponse(500, e.msg);
    }
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

function isValidUserAuth(userAuth){
    if (!userAuth){
        return false;
    }

    if (typeof userAuth !== 'string'){
        return false;
    }

    return true;
}

/**
 * 
 * @param {Number} code 
 * @param {String} msg 
 * @param {String|undefined} details default: undefined
 */
function createErrorResponse(code, msg, details=undefined){
    return {
        err: {
            code,
            msg,
            details,
        }
    };
}

module.exports = {
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteAll,
};