const { Schema, model } = require('mongoose');
const { pbkdf2 } = require('crypto');

const userSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
    },
    hash: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true,
    },
});

const userModel = model('User', userSchema);

/**
 * Encrypt password
 * 
 * @param {String} password 
 * @param {undefined|String} salt default: undefined
 * @returns [err: boolean, msg: String, salt: String, derivedKey: String]
 */
function encryptPassword(password, salt=undefined){
    return new Promise((resolve, reject) => {
        const localSalt = !!salt?salt:(process.env.userHashSalt || '[tempSalt]');
        const hashAlgorithm = process.env.hashAlgorithm || 'sha512';

        pbkdf2(password, localSalt, 310000, 32, hashAlgorithm, (err, derivedKey) => {
            if (err){
                return reject([true, 'Failed to create hash']);
            }

            resolve([false, null, localSalt, derivedKey.toString('hex')]);
        });
    });
}

module.exports = {
    User: userModel,
    encryptPassword,
};