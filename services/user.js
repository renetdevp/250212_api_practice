const { User, encryptPassword } = require('../models/user');

/**
 * Create user(userId) with userId,hash
 * 
 * @param {String} userId 
 * @param {String} hash 
 * @returns {Array} [code: Number, msg: String]
 */
function createOne(userId, hash){
    return new Promise(async (resolve, reject) => {
        if (!isValidUserFormat({ userId, hash })){
            return reject([400, 'Invalid User Format']);
        }

        try {
            const count = await User.countDocuments({ userId }).exec();
            if (count > 0){
                return reject([409, `User ${userId} already exists`]);
            }

            const [err, msg, salt, encrypted] = await encryptPassword(hash);
            if (err){
                return reject([500, msg]);
            }

            const newUser = new User({ userId, hash: encrypted, salt });
            await newUser.save();

            resolve([201, `User ${userId} created`]);
        }catch (e){
            const [code, msg] = e;
            reject([code, msg]);
        }
    });
}

/**
 * Read user(userId) with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Array} [code: Number, msg: String, user: Object]
 */
function readOne(filter = {}, projection = { userId: 1, _id: 0 }){
    return new Promise((resolve, reject) => {
        if (typeof filter?.userId !== 'string'){
            return reject([400, 'Invalid userId', null]);
        }

        const findOnePromise = User.findOne(filter, projection).lean().exec();

        findOnePromise.then((user) => {
            if (isEmptyUser(user)){
                return reject([404, `User ${filter?.userId} not found`, null]);
            }

            resolve([200, null, user]);
        })
        .catch((err) => {
            reject([500, err, null]);
        });
    });
}

/**
 * Read all user with filter
 * 
 * @param {Object} filter 
 * @param {Object} projection 
 * @returns {Array} [code: Number, msg: String, users: Array]
 */
function readAll(filter = {}, projection = { userId: 1, _id: 0}){
    return new Promise((resolve, reject) => {
        const findPromise = User.find(filter, projection).lean().exec();

        findPromise.then((users) => {
            resolve([200, null, users]);
        })
        .catch((err) => {
            reject([500, 'Failed to read Users', null]);
        });
    });
}

/**
 * Update user(userId)
 * 
 * @param {String} userId 
 * @param {Object} user 
 * @returns {Array} [code: Number, msg: String]
 */
function updateOne(userId, user){
    return new Promise(async (resolve, reject) => {
        if (typeof userId !== 'string'){
            return reject([400, 'Invalid userId format']);
        }

        if (!isValidUserFormat(user)){
            return reject([400, 'Invalid user format']);
        }

        const updateOnePromise = User.updateOne({ userId: userId }, user).exec();

        updateOnePromise.then((result) => {
            if (result.matchedCount === 0){
                return reject([404, `User ${userId} not found`]);
            }

            resolve([201, `User ${userId} updated`]);
        })
        .catch((err) => {
            reject([500, err]);
        });
    });
}

/**
 * Delete user(userId) with userId
 * 
 * @param {String} userId 
 * @returns {Array} [code: Number, msg: String]
 */
function deleteOne(userId){
    return new Promise((resolve, reject) => {
        if (typeof userId !== 'string'){
            return reject([400, 'Invalid input']);
        }

        const existsPromise = User.exists({ userId: userId }).exec();

        existsPromise.then((isExist) => {
            if (!isExist){
                return reject([404, `User ${userId} not found`]);
            }
        })
        .then(() => {
            const deletePromise = User.deleteOne({ userId: userId }).exec();

            deletePromise.then(() => {
                resolve([201, `User ${userId} deleted`]);
            });
        })
        .catch((err) => {
            reject([500, err]);
        });
    });
}

/**
 * Delete All User with filter
 * 
 * @param {Object} filter 
 * @returns {Array} [code: Number, msg: String]
 */
function deleteAll(filter = {}){
    return new Promise((resolve, reject) => {
        const deletePromise = User.deleteMany(filter).exec();

        deletePromise.then(() => {
            return resolve([201, 'All Users deleted']);
        })
        .catch((err) => {
            return reject([500, err])
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

module.exports = {
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteAll,
};