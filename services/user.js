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

async function updateOne(userId, user){
    /*
        return value
        0:  user(userId) modified
        -1: user request is not valid to user schema
        -2: user(userId) not found
        -3: server error
    */
    try {
        const isExist = await User.exists({ userId: userId });

        if ((typeof(user?.userId) !== 'string') || (typeof(user?.hash) !== 'string')){
            return -1;
        }

        if (!!isExist){
            await User.findOneAndUpdate({ userId: userId }, user);

            return 0;
        }else {
            // User not exists
            return -2;
        }
    } catch (e){
        return -3;
    }
}

async function deleteOne(userId){
    try {
        await User.deleteOne({ id: userId });

        return true;
    } catch (e){
        return false;
    }
}

async function deleteAll(){
    try {
        await User.deleteMany({});

        return true;
    } catch (e){
        return false;
    }
}

module.exports = {
    createOne,
    readOne,
    readAll,
    updateOne,
    deleteOne,
    deleteAll,
};