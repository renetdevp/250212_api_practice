const { Schema, model } = require('mongoose');

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

module.exports = {
    User: userModel,
};