const User = require('../models/user');
const crypto = require('crypto');

/**
 * Create user(userId) with userId,hash
 * 
 * @param {String} userId 
 * @param {String} hash 
 * @returns {Array} [code: Number, msg: String]
 */
function createOne(userId, hash){
    return new Promise((resolve, reject) => {
        const salt = process.env.userHashSalt || '[tempSalt]';
        const hashAlgorithm = process.env.hashAlgorithm || 'sha512';

        crypto.pbkdf2(hash, salt, 310000, 32, hashAlgorithm, async (err, derivedKey) => {
            try {
                if (err){
                    return reject([500, 'Failed to create hash']);
                }

                // User already exist
                const count = await User.countDocuments({ userId: userId });
                if (count > 0) return reject([409, `User ${userId} already exists`]);

                const newUser = new User({ userId, hash, salt });
                const error = newUser.validateSync();
                // User request is not valid to User schema
                if (!!error) return reject([400, 'Invalid User Format']);

                await newUser.save();

                resolve([201, `User ${userId} created`]);
            } catch (e){
                reject([500, 'Error while Create User']);
            }
        });
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

        try {
            const findOnePromise = User.findOne(filter, projection).exec();

            findOnePromise.then((user) => {
                if (!user || (Object.keys(user).length === 0)){
                    return reject([404, `User ${filter?.userId} not found`, null]);
                }

                resolve([200, null, user]);
            });
        }catch (e){
            reject([500, `Error while read User ${filter?.userId}`], null);
        }
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
        try {
            const findPromise = User.find(filter, projection).exec();

            findPromise.then((users) => {
                resolve([200, null, users]);
            });
        }catch (e){
            reject([500, 'Failed to read Users', null]);
        }
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
    return new Promise((resolve, reject) => {
        if (typeof userId !== 'string'){
            return reject([400, 'Invalid userId format']);
        }

        if (typeof user?.userId !== 'string' || typeof user?.hash !== 'string'){
            return reject([400, 'Invalid user format']);
        }

        const existsPromise = User.exists({ userId: userId }).exec();

        existsPromise.then((isExist) => {
            if (!isExist){
                return reject([404, `User ${userId} is not exist`]);
            }
        })
        .then(() => {
            const updatePromise = User.findOneAndUpdate({ userId: userId }, user).exec();

            updatePromise.then(() => {
                return resolve([201, `User ${userId} updated`]);
            });
        })
        .catch((err) => {
            return reject([500, err]);
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
                return resolve([201, `User ${userId} deleted`]);
            });
        })
        .catch((err) => {
            return reject([500, err]);
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

module.exports = {
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteAll,
};