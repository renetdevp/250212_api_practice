const { Schema, model } = require('mongoose');
const { randomBytes, pbkdf2 } = require('crypto');

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
    // salt를 Buffer 타입으로 사용할 때, 하단의 encryptPassword 함수 내 주석 참조
    // salt: {
    //     type: Buffer,
    //     required: true,
    // },
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

module.exports = {
    User: userModel,
    encryptPassword,
    isValidUserFormat,
};