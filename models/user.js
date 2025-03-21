const { Schema, model } = require('mongoose');
const { getRamdomBytes, pbkdf2 } = require('crypto');

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
 * @returns {Promise<object>} { err: object|null, salt: String, derivedKey: String }
 */
function encryptPassword(password, salt=undefined){
    return new Promise((resolve, reject) => {
        const localSalt = !!salt?salt:getRamdomBytes(16);
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

module.exports = {
    User: userModel,
    encryptPassword,
    isValidUserFormat,
};