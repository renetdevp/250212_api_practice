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
});

module.exports = model('User', userSchema);