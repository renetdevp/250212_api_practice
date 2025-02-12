const { model, Schema } = require('mongoose');

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = model('Post', postSchema);