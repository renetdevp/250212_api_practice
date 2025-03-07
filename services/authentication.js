const jwt = require('jsonwebtoken');
const { timingSafeEqual } = require('crypto');
const { User, encryptPassword } = require('../models/user');

function authenticate(userId, hash){
    return new Promise(async (resolve, reject) => {
        if (!isValidUserFormat({ userId, hash })){
            return reject([400, 'Invalid User Format', null]);
        }

        const user = await User.findOne({ userId }, { hash: 1, salt: 1 }).lean().exec();
        if (!user){
            return reject([404, `User ${userId} not found`]);
        }

        const [err, msg, localSalt, encrypted] = await encryptPassword(hash, user.salt);
        const encryptedBuffer = Buffer.from(encrypted, 'utf-8');
        const userHashBuffer = Buffer.from(user.hash, 'utf-8');
        if (!timingSafeEqual(encryptedBuffer, userHashBuffer)){
            return reject([401, 'Failed to Authenticate', null]);
        }

        const jwtSecret = process.env.jwtSecret || 'thisissecret';
        const jwtOption = {
            algorithm: 'HS512',
            expiresIn: '1h',
        }
        //  https://stackoverflow.com/a/56872864, jwt.sign()은 callback 함수가 제공되면 비동기로, 제공되지 않으면 동기식으로 작동함
        jwt.sign({ userId: userId }, jwtSecret, jwtOption, (err, token) => {
            if (err){
                return reject([500, err]);
            }

            resolve([201, null, token]);
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
    authenticate,
};